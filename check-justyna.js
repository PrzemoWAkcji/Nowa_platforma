const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:c:/nowa platforma/athletics-platform/backend/prisma/dev.db",
    },
  },
});

async function checkJustyna() {
  console.log("🔍 Checking Justyna details...");

  try {
    const justyna = await prisma.athlete.findFirst({
      where: {
        firstName: "Justyna",
      },
    });

    if (justyna) {
      console.log(`👤 Found Justyna:`);
      console.log(`   ID: ${justyna.id}`);
      console.log(`   First Name: "${justyna.firstName}"`);
      console.log(`   Last Name: "${justyna.lastName}"`);
      console.log(`   Date of Birth: ${justyna.dateOfBirth}`);
      console.log(`   Club: "${justyna.club}"`);
      console.log(`   License: "${justyna.licenseNumber}"`);
      console.log(`   PB: ${JSON.stringify(justyna.personalBests)}`);
      console.log(`   SB: ${JSON.stringify(justyna.seasonBests)}`);
    } else {
      console.log("❌ Justyna not found");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJustyna();
