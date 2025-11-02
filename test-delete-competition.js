const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDeleteCompetition() {
  try {
    const competitionId = "cmd738eub0001uqeouy11ea9c";

    console.log("1. Sprawdzanie zawodów...");
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        registrations: true,
        events: {
          include: {
            results: true,
            relayTeamRegistrations: true,
          },
        },
        relayTeams: {
          include: {
            results: true,
          },
        },
      },
    });

    if (!competition) {
      console.log("❌ Zawody nie zostały znalezione");
      return;
    }

    console.log(`✅ Zawody znalezione: ${competition.name}`);
    console.log(`📊 Liczba rejestracji: ${competition.registrations.length}`);
    console.log(`🏃 Liczba konkurencji: ${competition.events.length}`);
    console.log(
      `👥 Liczba zespołów sztafetowych: ${competition.relayTeams.length}`
    );

    // Sprawdź czy są rejestracje
    if (competition.registrations && competition.registrations.length > 0) {
      console.log("❌ Nie można usunąć zawodów - są rejestracje");
      console.log("💡 Użyj przycisku 'Usuń wszystkie' na stronie rejestracji");
      return;
    }

    // Sprawdź czy są wyniki w konkurencjach
    const hasResults = competition.events.some(
      (event) => event.results && event.results.length > 0
    );

    if (hasResults) {
      console.log("❌ Nie można usunąć zawodów - są wyniki w konkurencjach");
      return;
    }

    // Sprawdź czy są rejestracje zespołów sztafetowych
    const hasRelayRegistrations = competition.events.some(
      (event) =>
        event.relayTeamRegistrations && event.relayTeamRegistrations.length > 0
    );

    if (hasRelayRegistrations) {
      console.log(
        "❌ Nie można usunąć zawodów - są rejestracje zespołów sztafetowych"
      );
      return;
    }

    // Sprawdź czy są wyniki zespołów sztafetowych
    const hasRelayResults = competition.relayTeams.some(
      (team) => team.results && team.results.length > 0
    );

    if (hasRelayResults) {
      console.log(
        "❌ Nie można usunąć zawodów - są wyniki zespołów sztafetowych"
      );
      return;
    }

    // Sprawdź czy są zespoły sztafetowe
    if (competition.relayTeams && competition.relayTeams.length > 0) {
      console.log("❌ Nie można usunąć zawodów - są zespoły sztafetowe");
      return;
    }

    console.log("✅ Zawody można usunąć - brak przeszkód");
  } catch (error) {
    console.error("❌ Błąd:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteCompetition();
