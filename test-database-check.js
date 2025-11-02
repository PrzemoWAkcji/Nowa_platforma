const axios = require("axios");

async function testDatabaseCheck() {
  console.log("🔍 Testing Database Check");

  try {
    // 1. Login
    console.log("1️⃣ Logging in...");
    const loginResponse = await axios.post("http://localhost:3001/auth/login", {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    // 2. Get all athletes
    console.log("\n2️⃣ Getting all athletes...");
    const athletesResponse = await axios.get("http://localhost:3001/athletes", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`📊 Found ${athletesResponse.data.length} athletes`);

    // Find Aleksandra BORKOWSKA
    const aleksandra = athletesResponse.data.find(
      (a) => a.firstName === "Aleksandra" && a.lastName === "BORKOWSKA"
    );

    if (aleksandra) {
      console.log("\n👤 Aleksandra BORKOWSKA found:");
      console.log("   ID:", aleksandra.id);
      console.log("   Personal Bests:", aleksandra.personalBests);
      console.log("   Season Bests:", aleksandra.seasonBests);
      console.log("   Full record:", JSON.stringify(aleksandra, null, 2));
    } else {
      console.log("❌ Aleksandra BORKOWSKA not found");
    }

    // 3. Get all competitions
    console.log("\n3️⃣ Getting all competitions...");
    const competitionsResponse = await axios.get(
      "http://localhost:3001/competitions",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`📊 Found ${competitionsResponse.data.length} competitions`);

    // Get the latest competition
    const latestCompetition =
      competitionsResponse.data[competitionsResponse.data.length - 1];
    if (latestCompetition) {
      console.log("\n🏆 Latest competition:");
      console.log("   ID:", latestCompetition.id);
      console.log("   Name:", latestCompetition.name);

      // Get start list for this competition
      console.log("\n4️⃣ Getting start list...");
      const startListResponse = await axios.get(
        `http://localhost:3001/competitions/${latestCompetition.id}/start-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`📊 Start list entries: ${startListResponse.data.length}`);

      startListResponse.data.forEach((entry, index) => {
        console.log(`   Entry ${index + 1}:`, {
          athlete: `${entry.athlete?.firstName} ${entry.athlete?.lastName}`,
          seedTime: entry.seedTime,
          personalBest: entry.personalBest,
          seasonBest: entry.seasonBest,
        });
      });
    }

    console.log("\n🎉 Database check completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testDatabaseCheck();
