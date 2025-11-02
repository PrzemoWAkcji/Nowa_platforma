const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:c:/nowa platforma/athletics-platform/backend/prisma/dev.db",
    },
  },
});

async function countAllAthletes() {
  console.log("🔍 Counting all athletes...");

  try {
    const total = await prisma.athlete.count();
    console.log(`📊 Total athletes in database: ${total}`);

    // Pokaż wszystkich zawodników
    const athletesList = await prisma.athlete.findMany();
    console.log(`📊 All athletes in database:`);
    athletesList.forEach((athlete, index) => {
      console.log(
        `   ${index + 1}. ${athlete.firstName} ${athlete.lastName} (License: ${athlete.licenseNumber})`
      );
    });

    // Znajdź wszystkich z imieniem Justyna
    const justyna = await prisma.athlete.findMany({
      where: {
        firstName: "Justyna",
      },
    });

    console.log(
      `👤 Athletes with name containing 'Justyna': ${justyna.length}`
    );
    justyna.forEach((athlete, index) => {
      console.log(
        `   ${index + 1}. ${athlete.firstName} ${athlete.lastName} (ID: ${athlete.id})`
      );
      console.log(
        `      Date: ${athlete.dateOfBirth.toISOString().split("T")[0]}`
      );
      console.log(`      License: ${athlete.licenseNumber}`);
      console.log(`      PB: ${JSON.stringify(athlete.personalBests)}`);
      console.log(`      SB: ${JSON.stringify(athlete.seasonBests)}`);
    });

    // Sprawdź zawodników z rekordami - uproszczone zapytanie
    const allAthletes = await prisma.athlete.findMany();
    const withRecords = allAthletes.filter(
      (a) =>
        (a.personalBests && Object.keys(a.personalBests).length > 0) ||
        (a.seasonBests && Object.keys(a.seasonBests).length > 0)
    );

    console.log(`📊 Athletes with records in database: ${withRecords.length}`);
    withRecords.slice(0, 3).forEach((athlete, index) => {
      console.log(`   ${index + 1}. ${athlete.firstName} ${athlete.lastName}`);
      console.log(`      PB: ${JSON.stringify(athlete.personalBests)}`);
      console.log(`      SB: ${JSON.stringify(athlete.seasonBests)}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

countAllAthletes();
