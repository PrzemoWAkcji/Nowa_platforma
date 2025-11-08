import { PrismaClient } from '@prisma/client';

const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.uuanevlshccytwklhlrb:pomidorowa197@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
    },
  },
});

const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:SDluxFlauODePPUMpBHKeDOAfwwBbMoc@interchange.proxy.rlwy.net:40079/railway',
    },
  },
});

async function getTableColumns(db: PrismaClient, tableName: string): Promise<string[]> {
  const result: any[] = await db.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;
  return result.map(r => r.column_name);
}

async function clearTable(tableName: string) {
  try {
    await targetDb.$executeRawUnsafe(`DELETE FROM "${tableName}"`);
    console.log(`🗑️  ${tableName}: cleared`);
  } catch (error: any) {
    console.error(`❌ ${tableName}: failed to clear - ${error.message}`);
  }
}

async function copyTable(tableName: string) {
  try {
    const rows: any[] = await sourceDb.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    
    if (rows.length === 0) {
      console.log(`⏭️  ${tableName}: skipped (empty)`);
      return;
    }

    const targetColumns = await getTableColumns(targetDb, tableName);
    const sourceColumns = Object.keys(rows[0]);
    
    const validColumns = sourceColumns.filter(col => targetColumns.includes(col));
    
    if (validColumns.length !== sourceColumns.length) {
      const skipped = sourceColumns.filter(col => !targetColumns.includes(col));
      console.log(`⚠️  ${tableName}: skipping columns: ${skipped.join(', ')}`);
    }

    const valuesList: string[] = [];
    
    for (const row of rows) {
      const values = validColumns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return val;
      });
      valuesList.push(`(${values.join(', ')})`);
    }

    const insertQuery = `
      INSERT INTO "${tableName}" (${validColumns.map(c => `"${c}"`).join(', ')})
      VALUES ${valuesList.join(',\n')}
    `;

    await targetDb.$executeRawUnsafe(insertQuery);
    console.log(`✅ ${tableName}: migrated ${rows.length} rows`);
  } catch (error: any) {
    console.error(`❌ ${tableName}: ${error.message}`);
  }
}

async function migrate() {
  try {
    console.log('🗑️  Clearing Railway database...\n');

    const clearOrder = [
      'heat_assignments',
      'heats',
      'schedule_items',
      'competition_schedules',
      'records',
      'protests',
      'combined_event_results',
      'combined_events',
      'relay_team_results',
      'relay_team_registrations',
      'relay_team_members',
      'relay_teams',
      'results',
      'registration_events',
      'registrations',
      'events',
      'athletes',
      'competitions',
      'users',
    ];

    for (const table of clearOrder) {
      await clearTable(table);
    }

    console.log('\n📦 Starting migration...\n');

    const orderedTables = [
      'users',
      'competitions',
      'athletes',
      'events',
      'registrations',
      'registration_events',
      'results',
      'relay_teams',
      'relay_team_members',
      'relay_team_registrations',
      'relay_team_results',
      'combined_events',
      'combined_event_results',
      'protests',
      'records',
      'competition_schedules',
      'schedule_items',
      'heats',
      'heat_assignments',
    ];

    for (const table of orderedTables) {
      await copyTable(table);
    }

    console.log('\n✅ Migration completed!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

migrate();
