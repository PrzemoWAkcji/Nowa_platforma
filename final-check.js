const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function finalCheck() {
  console.log("🎯 Final check - Justyna's records...");

  try {
    const justyna = await prisma.athlete.findUnique({
      where: { licenseNumber: "Z/0337/18" },
    });

    if (!justyna) {
      console.log("❌ Justyna not found!");
      return;
    }

    console.log(`✅ Found: ${justyna.firstName} ${justyna.lastName}`);
    console.log(
      `📅 Date of birth: ${justyna.dateOfBirth.toISOString().split("T")[0]}`
    );
    console.log(`🏃‍♀️ License: ${justyna.licenseNumber}`);

    console.log("\n🏆 Personal Bests:");
    if (justyna.personalBests) {
      Object.entries(justyna.personalBests).forEach(([event, record]) => {
        console.log(`   ${event}: ${record.result} (${record.date})`);
      });
    }

    console.log("\n🌟 Season Bests:");
    if (justyna.seasonBests) {
      Object.entries(justyna.seasonBests).forEach(([event, record]) => {
        console.log(`   ${event}: ${record.result} (${record.date})`);
      });
    }

    // Sprawdź konkretnie 800M
    const pb800 = justyna.personalBests?.["800M"];
    const sb800 = justyna.seasonBests?.["800M"];

    console.log("\n🎯 800M Analysis:");
    console.log(`   PB: ${pb800?.result || "NONE"} (expected: 1:48.50)`);
    console.log(`   SB: ${sb800?.result || "NONE"} (expected: 1:49.00)`);

    if (pb800?.result === "1:48.50" && sb800?.result === "1:49.00") {
      console.log("✅ SUCCESS: Import worked correctly!");
    } else {
      console.log("❌ FAILED: Records not updated as expected");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

finalCheck();
