const { Client } = require('pg');

const SOURCE_URL = 'postgresql://postgres.uuanevlshccytwklhlrb:pomidorowa@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
const TARGET_URL = 'postgresql://postgres:SDluxFlauODePPUMpBHKeDOAfwwBbMoc@interchange.proxy.rlwy.net:40079/railway';

async function migrate() {
  const source = new Client({ connectionString: SOURCE_URL });
  const target = new Client({ connectionString: TARGET_URL });

  try {
    await source.connect();
    await target.connect();
    console.log('Connected to both databases');

    const tables = ['User', 'Competition', 'Event', 'Result', 'News'];
    
    for (const table of tables) {
      console.log(`\nMigrating ${table}...`);
      
      const { rows } = await source.query(`SELECT * FROM "${table}"`);
      console.log(`Found ${rows.length} rows`);
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const placeholders = rows.map((_, i) => 
          `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
        ).join(', ');
        
        const values = rows.flatMap(row => columns.map(col => row[col]));
        
        await target.query(
          `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
          values
        );
        console.log(`✓ Migrated ${rows.length} rows`);
      }
    }

    console.log('\n✓ Migration completed!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await source.end();
    await target.end();
  }
}

migrate();
