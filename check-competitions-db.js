const { PrismaClient } = require("@prisma/client");
const path = require("path");

// Ustaw ścieżkę do bazy danych
const databaseUrl = `file:${path.join(__dirname, "athletics-platform/backend/prisma/dev.db")}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function checkCompetitions() {
  try {
    console.log("🔍 Sprawdzanie zawodów w bazie danych...");

    // Sprawdź wszystkie zawody
    const competitions = await prisma.competition.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
            events: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    console.log(`📊 Znaleziono ${competitions.length} zawodów:`);

    if (competitions.length === 0) {
      console.log("❌ Brak zawodów w bazie danych!");

      // Sprawdź użytkowników
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      console.log(`👥 Użytkownicy w bazie (${users.length}):`);
      users.forEach((user) => {
        console.log(
          `  - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`
        );
      });
    } else {
      competitions.forEach((comp, index) => {
        console.log(`\n${index + 1}. ${comp.name}`);
        console.log(`   ID: ${comp.id}`);
        console.log(`   Status: ${comp.status}`);
        console.log(`   Data: ${comp.startDate} - ${comp.endDate || "brak"}`);
        console.log(`   Lokalizacja: ${comp.location}`);
        console.log(
          `   Utworzony przez: ${comp.createdBy?.email || "brak"} (${comp.createdBy?.role || "brak"})`
        );
        console.log(`   Rejestracje: ${comp._count.registrations}`);
        console.log(`   Wydarzenia: ${comp._count.events}`);
      });
    }
  } catch (error) {
    console.error("❌ Błąd podczas sprawdzania bazy danych:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompetitions();
