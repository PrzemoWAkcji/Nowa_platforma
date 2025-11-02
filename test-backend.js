const axios = require("axios");

async function testBackend() {
  console.log("🔍 Testing backend endpoints...");

  try {
    // Test login
    console.log("\n1. Testing login...");
    const loginResponse = await axios.post("http://localhost:3001/auth/login", {
      email: "admin@athletics.pl",
      password: "password123",
    });
    console.log("✅ Login successful");
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test athletes endpoint
    console.log("\n2. Testing /athletes endpoint...");
    try {
      const athletesResponse = await axios.get(
        "http://localhost:3001/athletes",
        { headers }
      );
      console.log(
        `✅ Athletes endpoint works, returned ${athletesResponse.data.length} athletes`
      );

      // Znajdź Justynę
      const justyna = athletesResponse.data.find(
        (a) => a.firstName === "Justyna"
      );
      if (justyna) {
        console.log(
          `✅ Found Justyna: ${justyna.firstName} ${justyna.lastName}`
        );
        console.log(`   PB: ${JSON.stringify(justyna.personalBests)}`);
        console.log(`   SB: ${JSON.stringify(justyna.seasonBests)}`);
      } else {
        console.log(`❌ Justyna not found in first 100 athletes`);
      }

      // Sprawdź czy ktoś ma rekordy
      const athletesWithRecords = athletesResponse.data.filter(
        (a) =>
          (a.personalBests && Object.keys(a.personalBests).length > 0) ||
          (a.seasonBests && Object.keys(a.seasonBests).length > 0)
      );
      console.log(`📊 Athletes with records: ${athletesWithRecords.length}`);

      athletesWithRecords.slice(0, 3).forEach((athlete) => {
        console.log(`   - ${athlete.firstName} ${athlete.lastName}`);
        if (athlete.personalBests) {
          console.log(`     PB: ${JSON.stringify(athlete.personalBests)}`);
        }
        if (athlete.seasonBests) {
          console.log(`     SB: ${JSON.stringify(athlete.seasonBests)}`);
        }
      });
    } catch (error) {
      console.error(
        "❌ Athletes endpoint failed:",
        error.response?.status,
        error.response?.statusText
      );
    }

    // Test competitions endpoint
    console.log("\n3. Testing /competitions endpoint...");
    try {
      const competitionsResponse = await axios.get(
        "http://localhost:3001/competitions",
        { headers }
      );
      console.log(
        `✅ Competitions endpoint works, returned ${competitionsResponse.data.length} competitions`
      );
    } catch (error) {
      console.error(
        "❌ Competitions endpoint failed:",
        error.response?.status,
        error.response?.statusText
      );
    }
  } catch (error) {
    console.error("❌ Backend test failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error(
        "💡 Backend is not running! Start it with: cd athletics-platform/backend && npm run start:dev"
      );
    }
  }
}

testBackend();
