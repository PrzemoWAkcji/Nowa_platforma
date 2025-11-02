const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:c:/nowa platforma/athletics-platform/backend/prisma/dev.db",
    },
  },
});

async function countAthletes() {
  console.log("🔍 Counting athletes...");

  try {
    const total = await prisma.athlete.count();
    console.log(`📊 Total athletes: ${total}`);

    const justyna = await prisma.athlete.findMany({
      where: {
        firstName: "Justyna",
      },
    });

    console.log(`👤 Justyna athletes: ${justyna.length}`);
    justyna.forEach((athlete, index) => {
      console.log(
        `   ${index + 1}. ${athlete.firstName} ${athlete.lastName} (ID: ${athlete.id})`
      );
      console.log(`      Date of Birth: ${athlete.dateOfBirth}`);
      console.log(
        `      Date of Birth ISO: ${athlete.dateOfBirth.toISOString()}`
      );
      console.log(
        `      Date of Birth Date only: ${athlete.dateOfBirth.toISOString().split("T")[0]}`
      );
      console.log(`      PB: ${JSON.stringify(athlete.personalBests)}`);
      console.log(`      SB: ${JSON.stringify(athlete.seasonBests)}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

countAthletes();
