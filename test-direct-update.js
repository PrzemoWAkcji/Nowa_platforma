const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:c:/nowa platforma/athletics-platform/backend/prisma/dev.db",
    },
  },
});

async function testDirectUpdate() {
  console.log("🔍 Testing direct PB/SB update...");

  try {
    // Znajdź pierwszego zawodnika
    const athlete = await prisma.athlete.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    if (!athlete) {
      console.log("❌ No athletes found");
      return;
    }

    console.log(`👤 Found athlete: ${athlete.firstName} ${athlete.lastName}`);
    console.log(`   Current PB: ${JSON.stringify(athlete.personalBests)}`);
    console.log(`   Current SB: ${JSON.stringify(athlete.seasonBests)}`);

    // Bezpośrednio zaktualizuj PB i SB
    const personalBests = {
      "1500M": {
        result: "4:20.30",
        date: "2025-07-18",
        competition: "Test Direct Update",
      },
    };

    const seasonBests = {
      "1500M": {
        result: "4:25.50",
        date: "2025-07-18",
        competition: "Test Direct Update",
      },
    };

    console.log("\n💾 Updating athlete with new PB/SB...");
    const updated = await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        personalBests,
        seasonBests,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    console.log("✅ Update completed!");
    console.log(`   New PB: ${JSON.stringify(updated.personalBests)}`);
    console.log(`   New SB: ${JSON.stringify(updated.seasonBests)}`);

    // Sprawdź czy dane zostały zapisane
    console.log("\n🔍 Verifying update...");
    const verified = await prisma.athlete.findUnique({
      where: { id: athlete.id },
      select: {
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    console.log(`👤 Verified: ${verified.firstName} ${verified.lastName}`);
    console.log(`   Verified PB: ${JSON.stringify(verified.personalBests)}`);
    console.log(`   Verified SB: ${JSON.stringify(verified.seasonBests)}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectUpdate();
