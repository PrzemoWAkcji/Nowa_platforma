const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:c:/nowa platforma/athletics-platform/backend/prisma/dev.db",
    },
  },
});

async function checkDatabase() {
  console.log("🔍 Checking database for Anna TESTOWA...");

  try {
    // Sprawdź wszystkich zawodników o imieniu Anna lub nazwisku TESTOWA
    const annas = await prisma.athlete.findMany({
      where: {
        OR: [
          { firstName: { contains: "Anna" } },
          { lastName: { contains: "TESTOWA" } },
          { firstName: { contains: "CIESIELSKA" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
        dateOfBirth: true,
        club: true,
      },
    });

    console.log(`📊 Found ${annas.length} athletes with Anna in name:`);
    annas.forEach((anna) => {
      console.log(`👤 ${anna.firstName} ${anna.lastName}:`);
      console.log(`   ID: ${anna.id}`);
      console.log(`   Club: ${anna.club}`);
      console.log(`   DOB: ${anna.dateOfBirth}`);
      console.log(`   Personal Bests: ${JSON.stringify(anna.personalBests)}`);
      console.log(`   Season Bests: ${JSON.stringify(anna.seasonBests)}`);
      console.log("");
    });

    // Sprawdź ostatnich 5 zawodników
    console.log("\n📊 Last 5 athletes in database:");
    const lastAthletes = await prisma.athlete.findMany({
      orderBy: { id: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
        club: true,
      },
    });

    lastAthletes.forEach((athlete) => {
      console.log(
        `👤 ${athlete.firstName} ${athlete.lastName} (${athlete.club})`
      );
      console.log(`   ID: ${athlete.id}`);
      console.log(`   PB: ${JSON.stringify(athlete.personalBests)}`);
      console.log(`   SB: ${JSON.stringify(athlete.seasonBests)}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
