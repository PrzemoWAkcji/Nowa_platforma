const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkRegistrations() {
  try {
    const competitionId = "cmd738eub0001uqeouy11ea9c";

    // Sprawdź czy zawody istnieją
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true, name: true },
    });

    console.log("Competition:", competition);

    // Sprawdź rejestracje dla tych zawodów
    const registrations = await prisma.registration.findMany({
      where: { competitionId },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            club: true,
          },
        },
      },
    });

    console.log("Registrations count:", registrations.length);
    console.log("Registrations:", registrations);

    // Sprawdź wszystkie rejestracje w systemie
    const allRegistrations = await prisma.registration.findMany({
      select: {
        id: true,
        competitionId: true,
        athlete: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log("All registrations count:", allRegistrations.length);
    console.log("All registrations:", allRegistrations);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistrations();
