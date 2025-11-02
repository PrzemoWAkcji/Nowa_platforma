const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixJustynaLicense() {
  console.log("🔧 Fixing Justyna's license number...");

  try {
    // Znajdź Justynę
    const justyna = await prisma.athlete.findFirst({
      where: {
        firstName: "Justyna",
        lastName: "Święty-Ersetic",
      },
    });

    if (!justyna) {
      console.log("❌ Justyna not found!");
      return;
    }

    console.log(`✅ Found Justyna: ${justyna.firstName} ${justyna.lastName}`);
    console.log(`   Current license: ${justyna.licenseNumber}`);

    // Zaktualizuj licenseNumber
    const updated = await prisma.athlete.update({
      where: { id: justyna.id },
      data: { licenseNumber: "Z/0337/18" },
    });

    console.log(`✅ Updated license to: ${updated.licenseNumber}`);
    console.log("🎉 Fix completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixJustynaLicense();
