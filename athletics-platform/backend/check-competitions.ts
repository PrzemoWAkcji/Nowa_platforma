import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:SDluxFlauODePPUMpBHKeDOAfwwBbMoc@interchange.proxy.rlwy.net:40079/railway',
    },
  },
});

async function check() {
  try {
    const competitions = await db.competition.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        isPublic: true,
        startDate: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    console.log('\n📊 Zawody w Railway:\n');
    competitions.forEach((comp) => {
      console.log(`${comp.name}`);
      console.log(`  Status: ${comp.status}`);
      console.log(`  Public: ${comp.isPublic}`);
      console.log(`  Start: ${comp.startDate.toISOString().split('T')[0]}`);
      console.log(`  Rejestracje: ${comp._count.registrations}`);
      console.log('');
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

check();
