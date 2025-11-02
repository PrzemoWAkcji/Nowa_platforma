const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function findLicense() {
  console.log("🔍 Finding license Z/0337/18...");

  try {
    const athlete = await prisma.athlete.findUnique({
      where: {
        licenseNumber: "Z/0337/18",
      },
    });

    if (athlete) {
      console.log(`✅ Found athlete with license Z/0337/18:`);
      console.log(`   Name: ${athlete.firstName} ${athlete.lastName}`);
      console.log(`   ID: ${athlete.id}`);
      console.log(
        `   Date: ${athlete.dateOfBirth.toISOString().split("T")[0]}`
      );
      console.log(`   PB: ${JSON.stringify(athlete.personalBests)}`);
      console.log(`   SB: ${JSON.stringify(athlete.seasonBests)}`);
    } else {
      console.log("❌ No athlete found with license Z/0337/18");
    }

    // Sprawdź wszystkich z imieniem Justyna
    const allJustyna = await prisma.athlete.findMany({
      where: {
        firstName: "Justyna",
      },
    });

    console.log(`\n📊 All Justyna athletes: ${allJustyna.length}`);
    allJustyna.forEach((athlete, index) => {
      console.log(
        `   ${index + 1}. ${athlete.firstName} ${athlete.lastName} (ID: ${athlete.id})`
      );
      console.log(`      License: ${athlete.licenseNumber}`);
      console.log(
        `      Date: ${athlete.dateOfBirth.toISOString().split("T")[0]}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findLicense();
