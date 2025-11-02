const { PrismaClient } = require("@prisma/client");

async function fixCompetitions() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:C:/nowa platforma/athletics-platform/backend/prisma/dev.db",
      },
    },
  });

  try {
    console.log("🔧 Aktualizowanie statusu zawodów wielobojowych...\n");

    // Znajdź zawody wielobojowe ze statusem DRAFT i isPublic: true
    const draftMultiEvents = await prisma.competition.findMany({
      where: {
        type: "MULTI_EVENT",
        status: "DRAFT",
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        status: true,
        isPublic: true,
      },
    });

    console.log(
      `Znaleziono ${draftMultiEvents.length} zawodów wielobojowych do aktualizacji:`
    );

    draftMultiEvents.forEach((comp, index) => {
      console.log(`${index + 1}. ${comp.name} (ID: ${comp.id})`);
    });

    if (draftMultiEvents.length > 0) {
      // Zaktualizuj status na PUBLISHED
      const result = await prisma.competition.updateMany({
        where: {
          type: "MULTI_EVENT",
          status: "DRAFT",
          isPublic: true,
        },
        data: {
          status: "PUBLISHED",
        },
      });

      console.log(
        `\n✅ Zaktualizowano ${result.count} zawodów wielobojowych na status PUBLISHED`
      );
    } else {
      console.log("\n❌ Brak zawodów wielobojowych do aktualizacji");
    }

    // Sprawdź wynik
    console.log("\n🔍 Sprawdzanie zawodów po aktualizacji...");

    const updatedCompetitions = await prisma.competition.findMany({
      where: {
        type: "MULTI_EVENT",
      },
      select: {
        id: true,
        name: true,
        status: true,
        isPublic: true,
      },
    });

    console.log(
      `\nZawody wielobojowe po aktualizacji (${updatedCompetitions.length}):`
    );
    updatedCompetitions.forEach((comp, index) => {
      console.log(
        `${index + 1}. ${comp.name} - Status: ${comp.status}, Publiczne: ${comp.isPublic}`
      );
    });
  } catch (error) {
    console.error("❌ Błąd:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompetitions();
