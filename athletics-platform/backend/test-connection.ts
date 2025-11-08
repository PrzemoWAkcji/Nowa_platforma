import { PrismaClient } from '@prisma/client';

const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.uuanevlshccytwklhlrb:pomidorowa197@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
    },
  },
});

async function test() {
  try {
    console.log('Testing Supabase connection...');
    await sourceDb.$connect();
    console.log('✅ Supabase connected!');
    
    const result: any = await sourceDb.$queryRaw`SELECT current_database(), current_user`;
    console.log('Database:', result);
    
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await sourceDb.$disconnect();
  }
}

test();
