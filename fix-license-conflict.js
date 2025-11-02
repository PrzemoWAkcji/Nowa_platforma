const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixLicenseConflict() {
  console.log("🔧 Fixing license conflict...");

  try {
    // 1. Znajdź Aleksandrę (która ma licenseNumber Justyny)
    const aleksandra = await prisma.athlete.findUnique({
      where: { licenseNumber: "Z/0337/18" },
    });

    if (aleksandra) {
      console.log(
        `✅ Found Aleksandra with Justyna's license: ${aleksandra.firstName} ${aleksandra.lastName}`
      );

      // Usuń licenseNumber od Aleksandry
      await prisma.athlete.update({
        where: { id: aleksandra.id },
        data: { licenseNumber: null },
      });
      console.log("✅ Removed license from Aleksandra");
    }

    // 2. Znajdź Justynę Święty-Ersetic
    const justyna = await prisma.athlete.findFirst({
      where: {
        firstName: "Justyna",
        lastName: "Święty-Ersetic",
      },
    });

    if (justyna) {
      console.log(`✅ Found Justyna: ${justyna.firstName} ${justyna.lastName}`);

      // Daj Justynie jej licenseNumber
      await prisma.athlete.update({
        where: { id: justyna.id },
        data: { licenseNumber: "Z/0337/18" },
      });
      console.log("✅ Assigned license Z/0337/18 to Justyna");
    }

    console.log("🎉 License conflict fixed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLicenseConflict();
