const { PrismaClient } = require("@prisma/client");

async function checkCompetitions() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:C:/nowa platforma/athletics-platform/backend/prisma/dev.db",
      },
    },
  });

  try {
    console.log("🔍 Sprawdzanie wszystkich zawodów...\n");

    const allCompetitions = await prisma.competition.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        isPublic: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Znaleziono ${allCompetitions.length} zawodów:\n`);

    allCompetitions.forEach((comp, index) => {
      console.log(`${index + 1}. ${comp.name}`);
      console.log(`   ID: ${comp.id}`);
      console.log(`   Typ: ${comp.type}`);
      console.log(`   Status: ${comp.status}`);
      console.log(`   Publiczne: ${comp.isPublic}`);
      console.log(`   Utworzone: ${comp.createdAt}`);
      console.log("");
    });

    // Sprawdź zawody wielobojowe
    const multiEventCompetitions = allCompetitions.filter(
      (c) => c.type === "MULTI_EVENT"
    );
    console.log(`\n🏆 Zawody wielobojowe (${multiEventCompetitions.length}):`);

    if (multiEventCompetitions.length === 0) {
      console.log("❌ Brak zawodów wielobojowych w bazie danych");
    } else {
      multiEventCompetitions.forEach((comp, index) => {
        console.log(
          `${index + 1}. ${comp.name} - Status: ${comp.status}, Publiczne: ${comp.isPublic}`
        );
      });
    }

    // Sprawdź zawody ze statusem DRAFT
    const draftCompetitions = allCompetitions.filter(
      (c) => c.status === "DRAFT"
    );
    console.log(`\n📝 Zawody ze statusem DRAFT (${draftCompetitions.length}):`);

    if (draftCompetitions.length === 0) {
      console.log("✅ Brak zawodów ze statusem DRAFT");
    } else {
      draftCompetitions.forEach((comp, index) => {
        console.log(
          `${index + 1}. ${comp.name} - Typ: ${comp.type}, Publiczne: ${comp.isPublic}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Błąd:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompetitions();
