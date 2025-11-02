const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:c:/nowa platforma/athletics-platform/backend/prisma/dev.db",
    },
  },
});

async function fixExistingAthletes() {
  console.log("🔧 Fixing existing athletes with sample PB/SB...");

  try {
    // Pobierz wszystkich zawodników
    const athletes = await prisma.athlete.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    // Filtruj tych bez PB/SB
    const athletesWithoutRecords = athletes.filter(
      (athlete) => !athlete.personalBests || !athlete.seasonBests
    );

    console.log(
      `📊 Found ${athletesWithoutRecords.length} athletes without PB/SB`
    );

    // Przykładowe wyniki dla różnych konkurencji
    const sampleResults = {
      "100M": { pb: "10.50", sb: "10.65" },
      "200M": { pb: "21.20", sb: "21.45" },
      "400M": { pb: "48.30", sb: "48.80" },
      "800M": { pb: "1:50.25", sb: "1:52.10" },
      "1500M": { pb: "4:20.30", sb: "4:25.50" },
      "5000M": { pb: "15:30.00", sb: "15:45.00" },
      "10000M": { pb: "32:15.00", sb: "32:30.00" },
    };

    let updated = 0;

    for (const athlete of athletesWithoutRecords) {
      // Wybierz losową konkurencję
      const events = Object.keys(sampleResults);
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const result = sampleResults[randomEvent];

      const personalBests = {
        [randomEvent]: {
          result: result.pb,
          date: "2024-06-15",
          competition: "Sample Championship",
        },
      };

      const seasonBests = {
        [randomEvent]: {
          result: result.sb,
          date: "2024-08-20",
          competition: "Sample Regional",
        },
      };

      await prisma.athlete.update({
        where: { id: athlete.id },
        data: {
          personalBests,
          seasonBests,
        },
      });

      console.log(
        `✅ Updated ${athlete.firstName} ${athlete.lastName} with ${randomEvent}: PB=${result.pb}, SB=${result.sb}`
      );
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} athletes!`);

    // Sprawdź wyniki
    console.log("\n🔍 Verifying updates...");
    const verifyAthletes = await prisma.athlete.findMany({
      take: 5,
      select: {
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    verifyAthletes.forEach((athlete) => {
      console.log(`👤 ${athlete.firstName} ${athlete.lastName}:`);
      console.log(`   PB: ${JSON.stringify(athlete.personalBests)}`);
      console.log(`   SB: ${JSON.stringify(athlete.seasonBests)}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingAthletes();
