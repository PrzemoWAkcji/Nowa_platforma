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

async function check() {
  try {
    console.log('Supabase users:');
    const sourceUsers: any[] = await sourceDb.$queryRaw`SELECT id, email FROM users ORDER BY id`;
    sourceUsers.forEach(u => console.log(`  - ${u.id}: ${u.email}`));
    
    console.log('\nRailway users:');
    const targetUsers: any[] = await targetDb.$queryRaw`SELECT id, email FROM users ORDER BY id`;
    targetUsers.forEach(u => console.log(`  - ${u.id}: ${u.email}`));
    
    console.log('\nSupabase competitions createdById:');
    const comps: any[] = await sourceDb.$queryRaw`SELECT id, name, "createdById" FROM competitions`;
    comps.forEach(c => console.log(`  - ${c.name}: createdById=${c.createdById}`));
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

check();
