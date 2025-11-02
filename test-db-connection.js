const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔄 Testing database connection...");

    const competitionCount = await prisma.competition.count();
    const athleteCount = await prisma.athlete.count();
    const eventCount = await prisma.event.count();
    const registrationCount = await prisma.registration.count();

    console.log("\n✅ Database Connection Successful!");
    console.log("━".repeat(50));
    console.log(`📊 Competitions: ${competitionCount}`);
    console.log(`🏃 Athletes: ${athleteCount}`);
    console.log(`🏆 Events: ${eventCount}`);
    console.log(`📝 Registrations: ${registrationCount}`);
    console.log("━".repeat(50));

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database Connection Failed!");
    console.error("Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
