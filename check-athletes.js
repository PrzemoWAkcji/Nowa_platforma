const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function checkAthletes() {
  try {
    console.log("🔐 Logging in...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    console.log("👥 Fetching all athletes...");
    const athletesResponse = await axios.get(`${API_BASE}/athletes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`📊 Total athletes: ${athletesResponse.data.length}`);

    // Pokaż ostatnich 10 zawodników
    const recentAthletes = athletesResponse.data.slice(-10);
    console.log("\n📋 Last 10 athletes:");

    recentAthletes.forEach((athlete, index) => {
      console.log(
        `${index + 1}. ${athlete.firstName} ${athlete.lastName} (${athlete.club})`
      );
      if (
        athlete.personalBests &&
        Object.keys(athlete.personalBests).length > 0
      ) {
        console.log(`   PB: ${JSON.stringify(athlete.personalBests)}`);
      }
      if (athlete.seasonBests && Object.keys(athlete.seasonBests).length > 0) {
        console.log(`   SB: ${JSON.stringify(athlete.seasonBests)}`);
      }
    });

    // Szukaj zawodników z "TEST" w nazwie
    const testAthletes = athletesResponse.data.filter(
      (athlete) =>
        (athlete.firstName && athlete.firstName.includes("TEST")) ||
        (athlete.lastName && athlete.lastName.includes("TEST")) ||
        (athlete.club && athlete.club.includes("Test"))
    );

    console.log(`\n🔍 Found ${testAthletes.length} test athletes:`);
    testAthletes.forEach((athlete) => {
      console.log(
        `- ${athlete.firstName} ${athlete.lastName} (${athlete.club})`
      );
      console.log(`  PB: ${JSON.stringify(athlete.personalBests || {})}`);
      console.log(`  SB: ${JSON.stringify(athlete.seasonBests || {})}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
  }
}

checkAthletes();
