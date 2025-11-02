const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testStartListCategories() {
  console.log("🧪 Testing Start List Categories Display");

  try {
    // 1. Login as admin
    console.log("\n1️⃣ Logging in as admin...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log("✅ Login successful");

    // 2. Get existing competitions
    console.log("\n2️⃣ Getting existing competitions...");
    const competitionsResponse = await axios.get(`${API_BASE}/competitions`, {
      headers,
    });

    const competitions = competitionsResponse.data;
    if (competitions.length === 0) {
      console.log("❌ No competitions found. Please import CSV first.");
      return;
    }

    // Find competition with events (from our CSV import test)
    const competition =
      competitions.find((c) => c.name.includes("CSV Import Fix")) ||
      competitions[competitions.length - 1];
    console.log(
      `✅ Using competition: ${competition.name} (${competition.id})`
    );

    // 3. Get competition details with events
    console.log("\n3️⃣ Getting competition events...");
    const competitionDetailsResponse = await axios.get(
      `${API_BASE}/competitions/${competition.id}`,
      { headers }
    );

    const events = competitionDetailsResponse.data.events || [];
    console.log(`✅ Found ${events.length} events`);

    // 4. Find "100 metrów kobiet" event
    const women100m = events.find(
      (e) =>
        e.name.includes("100") &&
        e.name.includes("kobiet") &&
        !e.name.includes("płotk")
    );

    if (!women100m) {
      console.log('❌ Could not find "100 metrów kobiet" event');
      return;
    }

    console.log(`\n📍 Testing event: ${women100m.name}`);
    console.log(`   Event ID: ${women100m.id}`);
    console.log(`   Category: ${women100m.category}`);

    // 5. Get start list for this event
    console.log("\n4️⃣ Getting start list...");
    const startListResponse = await axios.get(
      `${API_BASE}/registrations/start-list/${competition.id}/${women100m.id}?sortBy=PB`,
      { headers }
    );

    const startList = startListResponse.data;
    console.log(`✅ Start list contains ${startList.length} athletes`);

    // 6. Analyze categories in the start list
    const categories = new Set();
    startList.forEach((registration) => {
      categories.add(registration.athlete.category);
    });

    console.log(`\n📊 Age categories in this event: ${categories.size}`);
    console.log(`   Categories: ${Array.from(categories).join(", ")}`);

    const hasMultipleCategories = categories.size > 1;
    console.log(
      `   Multiple categories: ${hasMultipleCategories ? "YES" : "NO"}`
    );

    // 7. Show examples of athlete names
    console.log("\n👥 Example athlete names in start list:");
    startList.slice(0, 10).forEach((registration, index) => {
      const athlete = registration.athlete;
      const hasDisplayName = athlete.displayName || athlete.fullName;
      const displayName =
        hasDisplayName || `${athlete.firstName} ${athlete.lastName}`;

      console.log(
        `   ${index + 1}. ${displayName} (${athlete.category}) - Club: ${athlete.club || "N/A"}`
      );
    });

    // 8. Test FinishLynx export
    console.log("\n5️⃣ Testing FinishLynx export...");
    try {
      const finishLynxResponse = await axios.get(
        `${API_BASE}/finishlynx/export-start-lists/${competition.id}`,
        { headers }
      );

      const finishLynxData = finishLynxResponse.data;
      console.log(
        `✅ FinishLynx export contains ${finishLynxData.length} events`
      );

      // Find the same event in FinishLynx export
      const finishLynxEvent = finishLynxData.find(
        (event) =>
          event.name.includes("100") &&
          event.name.includes("kobiet") &&
          !event.name.includes("płotk")
      );

      if (finishLynxEvent) {
        console.log(`\n📍 FinishLynx event: ${finishLynxEvent.name}`);
        console.log(
          `   Registrations: ${finishLynxEvent.registrations.length}`
        );

        console.log("\n👥 Example athlete names in FinishLynx export:");
        finishLynxEvent.registrations.slice(0, 5).forEach((reg, index) => {
          console.log(
            `   ${index + 1}. ${reg.athlete.firstName} ${reg.athlete.lastName} - Club: ${reg.athlete.club || "N/A"}`
          );
        });

        // Check if categories are shown in lastName when multiple categories exist
        const hasCategories = finishLynxEvent.registrations.some(
          (reg) =>
            reg.athlete.lastName.includes("(") &&
            reg.athlete.lastName.includes(")")
        );

        console.log(
          `   Categories shown in names: ${hasCategories ? "YES" : "NO"}`
        );
      }
    } catch (error) {
      console.log(
        "⚠️ FinishLynx export failed (might need COACH role):",
        error.response?.status
      );
    }

    // 9. Summary
    console.log("\n📋 SUMMARY:");
    console.log(
      `✅ Event has multiple categories: ${hasMultipleCategories ? "YES" : "NO"}`
    );

    if (hasMultipleCategories) {
      console.log(
        "✅ Expected behavior: Categories should be shown in athlete names"
      );

      const hasDisplayNames = startList.some(
        (reg) =>
          reg.athlete.displayName && reg.athlete.displayName.includes("(")
      );

      console.log(
        `✅ Categories shown in start list: ${hasDisplayNames ? "YES" : "NO"}`
      );
    } else {
      console.log(
        "✅ Single category event - no need to show categories in names"
      );
    }

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/health`);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Backend server is not running!");
    console.log("Please start the server first:");
    console.log("  cd athletics-platform/backend");
    console.log("  npm run start:dev");
    return;
  }

  await testStartListCategories();
}

main().catch(console.error);
