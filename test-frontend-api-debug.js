const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testFrontendAPI() {
  console.log("🔍 Testing Frontend API - Start List with Records");

  try {
    // 1. Login as admin
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Login successful");

    // 2. Get competitions to find one with Anna LOZOVYTSKA
    console.log("\n2️⃣ Getting competitions...");
    const competitionsResponse = await axios.get(`${API_BASE}/competitions`, {
      headers,
    });
    const competitions = competitionsResponse.data;

    // Find competition with Anna
    let targetCompetition = null;
    let targetEvent = null;

    for (const competition of competitions) {
      console.log(`Checking competition: ${competition.name}`);

      // Get events for this competition
      const eventsResponse = await axios.get(`${API_BASE}/events`, {
        headers,
        params: { competitionId: competition.id },
      });
      const events = eventsResponse.data;

      // Look for 100MH event
      const event100MH = events.find(
        (e) => e.name.includes("100") && e.name.includes("pł")
      );
      if (event100MH) {
        console.log(`Found 100MH event: ${event100MH.name} (${event100MH.id})`);

        // Check if this event has registrations
        const registrationsResponse = await axios.get(
          `${API_BASE}/registrations/start-list/${competition.id}/${event100MH.id}`,
          { headers, params: { sortBy: "PB" } }
        );

        const registrations = registrationsResponse.data;
        console.log(
          `Found ${registrations.length} registrations in this event`
        );

        // Look for Anna LOZOVYTSKA
        const anna = registrations.find(
          (r) =>
            r.athlete?.lastName === "LOZOVYTSKA" &&
            r.athlete?.firstName === "Anna"
        );

        if (anna) {
          console.log("🎯 Found Anna LOZOVYTSKA!");
          targetCompetition = competition;
          targetEvent = event100MH;
          break;
        }
      }
    }

    if (!targetCompetition || !targetEvent) {
      console.log(
        "❌ Could not find competition with Anna LOZOVYTSKA in 100MH"
      );
      return;
    }

    console.log(
      `\n3️⃣ Testing API endpoint for competition: ${targetCompetition.name}`
    );
    console.log(`   Event: ${targetEvent.name} (${targetEvent.id})`);

    // 3. Test the exact API call that frontend makes
    const apiResponse = await axios.get(
      `${API_BASE}/registrations/start-list/${targetCompetition.id}/${targetEvent.id}`,
      {
        headers,
        params: { sortBy: "PB" },
      }
    );

    const registrations = apiResponse.data;
    console.log(`\n📊 API Response:`);
    console.log(`   Total registrations: ${registrations.length}`);

    // Find Anna LOZOVYTSKA
    const anna = registrations.find(
      (r) =>
        r.athlete?.lastName === "LOZOVYTSKA" && r.athlete?.firstName === "Anna"
    );

    if (anna) {
      console.log(`\n👤 Anna LOZOVYTSKA data structure:`);
      console.log(`   Athlete:`, JSON.stringify(anna.athlete, null, 2));
      console.log(`   Records:`, JSON.stringify(anna.records, null, 2));

      // Check specific fields that frontend expects
      console.log(`\n🔍 Frontend expects:`);
      console.log(
        `   anna.records?.personalBest?.result: "${anna.records?.personalBest?.result}"`
      );
      console.log(
        `   anna.records?.seasonBest?.result: "${anna.records?.seasonBest?.result}"`
      );

      if (anna.records?.personalBest?.result) {
        console.log("✅ PB data is present");
      } else {
        console.log("❌ PB data is MISSING");
      }

      if (anna.records?.seasonBest?.result) {
        console.log("✅ SB data is present");
      } else {
        console.log("❌ SB data is MISSING");
      }
    } else {
      console.log("❌ Anna LOZOVYTSKA not found in API response");
      console.log("Available athletes:");
      registrations.slice(0, 3).forEach((r) => {
        console.log(`   - ${r.athlete?.firstName} ${r.athlete?.lastName}`);
      });
    }

    console.log("\n🎉 Frontend API test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response?.status) {
      console.error(`   Status: ${error.response.status}`);
    }
  }
}

testFrontendAPI().catch(console.error);
