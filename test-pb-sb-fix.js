const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testPBSBFix() {
  console.log("🧪 Testing PB/SB Fix - Checking if records are displayed");

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

    // 2. Get competitions
    console.log("\n2️⃣ Getting competitions...");
    const competitionsResponse = await axios.get(`${API_BASE}/competitions`, {
      headers,
    });
    const competitions = competitionsResponse.data;

    if (competitions.length === 0) {
      console.log("❌ No competitions found");
      return;
    }

    // Find competition with CSV import data
    const competition =
      competitions.find((c) => c.name.includes("CSV Import")) ||
      competitions[0];
    console.log(
      `✅ Using competition: ${competition.name} (${competition.id})`
    );

    // 3. Get events for this competition
    console.log("\n3️⃣ Getting events...");
    const competitionDetailsResponse = await axios.get(
      `${API_BASE}/competitions/${competition.id}`,
      { headers }
    );
    const events = competitionDetailsResponse.data.events || [];

    console.log("Available events:");
    events.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.name} (${e.gender})`);
    });

    // Find 1500m women event
    let women1500m = events.find(
      (e) => e.name.includes("1500") && e.name.includes("kobiet")
    );

    // If not found, try different variations
    if (!women1500m) {
      women1500m = events.find(
        (e) => e.name.includes("1500") && e.gender === "FEMALE"
      );
    }

    // If still not found, use any women's event with multiple categories
    if (!women1500m) {
      women1500m = events.find((e) => e.gender === "FEMALE");
    }

    if (!women1500m) {
      console.log("❌ Could not find any women's event");
      return;
    }

    console.log(`✅ Found event: ${women1500m.name} (${women1500m.id})`);

    // 4. Get start list with records
    console.log("\n4️⃣ Getting start list with records...");
    const startListResponse = await axios.get(
      `${API_BASE}/registrations/start-list/${competition.id}/${women1500m.id}?sortBy=PB`,
      { headers }
    );

    const registrations = startListResponse.data;
    console.log(`✅ Found ${registrations.length} registrations`);

    // 5. Check PB/SB data
    console.log("\n5️⃣ Checking PB/SB data...");
    let athletesWithPB = 0;
    let athletesWithSB = 0;
    let athletesWithCategory = 0;

    console.log("\n📊 Sample athletes with records:");
    registrations.slice(0, 10).forEach((reg, index) => {
      const athlete = reg.athlete;
      const records = reg.records;

      const hasPB = records?.personalBest?.result;
      const hasSB = records?.seasonBest?.result;
      const hasCategory =
        athlete.displayName && athlete.displayName.includes("(");

      if (hasPB) athletesWithPB++;
      if (hasSB) athletesWithSB++;
      if (hasCategory) athletesWithCategory++;

      console.log(
        `${index + 1}. ${athlete.displayName || `${athlete.firstName} ${athlete.lastName}`}`
      );
      console.log(`   PB: ${hasPB ? records.personalBest.result : "-"}`);
      console.log(`   SB: ${hasSB ? records.seasonBest.result : "-"}`);
      console.log(`   Category in name: ${hasCategory ? "YES" : "NO"}`);
      console.log(
        `   Birth year: ${new Date(athlete.dateOfBirth).getFullYear()}`
      );
      console.log(`   Category: ${athlete.category}`);
      console.log("");
    });

    // 6. Summary
    console.log("\n📋 SUMMARY:");
    console.log(`✅ Total athletes: ${registrations.length}`);
    console.log(
      `✅ Athletes with PB: ${athletesWithPB} (${((athletesWithPB / registrations.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `✅ Athletes with SB: ${athletesWithSB} (${((athletesWithSB / registrations.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `✅ Athletes with category in name: ${athletesWithCategory} (${((athletesWithCategory / registrations.length) * 100).toFixed(1)}%)`
    );

    // Check if multiple categories exist
    const uniqueCategories = new Set(
      registrations.map((reg) => reg.athlete.category)
    );
    console.log(
      `✅ Unique categories: ${Array.from(uniqueCategories).join(", ")}`
    );
    console.log(
      `✅ Multiple categories: ${uniqueCategories.size > 1 ? "YES" : "NO"}`
    );

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

  await testPBSBFix();
}

main().catch(console.error);
