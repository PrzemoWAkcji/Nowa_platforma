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

async function getTables(db: PrismaClient): Promise<string[]> {
  const result: any[] = await db.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name != '_prisma_migrations'
    ORDER BY table_name
  `;
  return result.map(r => r.table_name);
}

async function copyTable(tableName: string) {
  try {
    const rows: any[] = await sourceDb.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    console.log(`📊 ${tableName}: ${rows.length} rows`);
    
    if (rows.length === 0) return;

    const columns = Object.keys(rows[0]);
    const valuesList: string[] = [];
    
    for (const row of rows) {
      const values = columns.map(col => {
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
      INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
      VALUES ${valuesList.join(',\n')}
      ON CONFLICT DO NOTHING
    `;

    await targetDb.$executeRawUnsafe(insertQuery);
    console.log(`✅ ${tableName}: migrated`);
  } catch (error: any) {
    console.error(`❌ ${tableName}: ${error.message}`);
  }
}

async function migrate() {
  try {
    console.log('🔍 Checking Supabase tables...\n');
    const tables = await getTables(sourceDb);
    console.log(`Found ${tables.length} tables:`, tables.join(', '));
    console.log('\n📦 Starting migration...\n');

    for (const table of tables) {
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
