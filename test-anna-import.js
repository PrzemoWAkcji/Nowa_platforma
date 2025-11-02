const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testAnnaImport() {
  try {
    console.log("🔍 Searching for Anna LOZOVYTSKA in database...");

    // Znajdź zawodniczkę Anna LOZOVYTSKA
    const athletes = await prisma.athlete.findMany({
      where: {
        OR: [
          { firstName: { contains: "Anna" } },
          { lastName: { contains: "LOZOVYTSKA" } },
        ],
      },
    });

    console.log(`Found ${athletes.length} athletes with Anna or LOZOVYTSKA:`);
    athletes.forEach((athlete) => {
      console.log(
        `- ${athlete.firstName} ${athlete.lastName} (ID: ${athlete.id})`
      );
      console.log(`  Date of birth: ${athlete.dateOfBirth}`);
      console.log(`  License: ${athlete.licenseNumber}`);
      console.log(`  PB: ${JSON.stringify(athlete.personalBests, null, 2)}`);
      console.log(`  SB: ${JSON.stringify(athlete.seasonBests, null, 2)}`);
      console.log("");
    });

    // Sprawdź czy istnieje zawodniczka o dokładnie takich danych jak w CSV
    const exactMatch = await prisma.athlete.findFirst({
      where: {
        firstName: "Anna",
        lastName: "LOZOVYTSKA",
        dateOfBirth: new Date("2005-12-22"),
      },
    });

    if (exactMatch) {
      console.log("✅ Found exact match for Anna LOZOVYTSKA:");
      console.log(`  ID: ${exactMatch.id}`);
      console.log(`  PB: ${JSON.stringify(exactMatch.personalBests, null, 2)}`);
      console.log(`  SB: ${JSON.stringify(exactMatch.seasonBests, null, 2)}`);

      // Sprawdź czy ma rekord w 100MH
      const pb = exactMatch.personalBests || {};
      const sb = exactMatch.seasonBests || {};

      console.log("🏃‍♀️ Records in 100MH:");
      console.log(
        `  PB in 100MH: ${pb["100MH"] ? JSON.stringify(pb["100MH"]) : "NONE"}`
      );
      console.log(
        `  SB in 100MH: ${sb["100MH"] ? JSON.stringify(sb["100MH"]) : "NONE"}`
      );

      // Sprawdź wszystkie klucze w rekordach
      console.log("📊 All PB keys:", Object.keys(pb));
      console.log("📊 All SB keys:", Object.keys(sb));
    } else {
      console.log("❌ No exact match found for Anna LOZOVYTSKA");
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
  }
}

testAnnaImport();
