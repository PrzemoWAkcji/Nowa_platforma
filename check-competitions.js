const { PrismaClient } = require('./athletics-platform/backend/node_modules/@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Sprawdź użytkowników admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true, password: true }
    });
    
    console.log('Administratorzy:');
    admins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.firstName} ${admin.lastName}) - hasło: ${admin.password.substring(0, 20)}...`);
    });
    console.log('');
    const competitions = await prisma.competition.findMany({
      where: {
        name: {
          contains: 'Test Sztafet'
        }
      },
      select: {
        id: true,
        name: true
      }
    });
    
    console.log('Zawody testowe:');
    competitions.forEach(c => {
      console.log(`- ${c.name} (${c.id})`);
    });
    
    if (competitions.length > 0) {
      const lastCompetition = competitions[competitions.length - 1];
      console.log(`\nSprawdzam konkurencje dla: ${lastCompetition.name}`);
      
      const events = await prisma.event.findMany({
        where: {
          competitionId: lastCompetition.id
        },
        select: {
          id: true,
          name: true,
          type: true
        }
      });
      
      console.log('\nWszystkie konkurencje:');
      events.forEach(e => {
        console.log(`- ${e.name} (${e.type}) (${e.id})`);
      });
      
      // Popraw typ konkurencji sztafetowych
      const relayEvents = events.filter(e => e.name.includes('4x'));
      if (relayEvents.length > 0) {
        console.log('\nPoprawiam typ konkurencji sztafetowych...');
        for (const event of relayEvents) {
          await prisma.event.update({
            where: { id: event.id },
            data: { type: 'RELAY' }
          });
          console.log(`✅ ${event.name} -> RELAY`);
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);