const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_BASE = "http://localhost:3001";

async function testCsvImportFix() {
  console.log("🧪 Testing CSV Import Fix - API Integration Test");

  try {
    // 1. Login as admin
    console.log("\n1️⃣ Logging in as admin...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    console.log("Login response:", loginResponse.data);
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log("✅ Login successful");

    // 2. Create a test competition
    console.log("\n2️⃣ Creating test competition...");
    const competitionResponse = await axios.post(
      `${API_BASE}/competitions`,
      {
        name: "Test Competition - CSV Import Fix",
        description: "Testing multiple age categories in single event",
        startDate: "2025-08-01T10:00:00.000Z",
        endDate: "2025-08-01T18:00:00.000Z",
        location: "Test Stadium",
        type: "OUTDOOR",
      },
      { headers }
    );

    const competitionId = competitionResponse.data.id;
    console.log(`✅ Competition created: ${competitionId}`);

    // 3. Import CSV file
    console.log("\n3️⃣ Importing CSV file...");
    const csvContent = fs.readFileSync("2025-07-19_WARS.csv");

    const formData = new FormData();
    formData.append("file", csvContent, {
      filename: "2025-07-19_WARS.csv",
      contentType: "text/csv",
    });
    formData.append("format", "PZLA");
    formData.append("updateExisting", "true");
    formData.append("createMissingAthletes", "true");

    const importResponse = await axios.post(
      `${API_BASE}/competitions/${competitionId}/import-startlist`,
      formData,
      {
        headers: {
          ...headers,
          ...formData.getHeaders(),
        },
      }
    );

    console.log("✅ CSV import completed");
    console.log(`   Imported: ${importResponse.data.importedCount} athletes`);
    console.log(`   Skipped: ${importResponse.data.skippedCount} athletes`);
    console.log(`   Updated: ${importResponse.data.updatedCount} athletes`);

    if (importResponse.data.errors?.length > 0) {
      console.log("⚠️ Errors:", importResponse.data.errors.slice(0, 3));
    }

    // 4. Check events created
    console.log("\n4️⃣ Checking events created...");
    const competitionDetailsResponse = await axios.get(
      `${API_BASE}/competitions/${competitionId}`,
      { headers }
    );
    const events = competitionDetailsResponse.data.events || [];

    console.log(`✅ Total events created: ${events.length}`);

    // Focus on "100 metrów kobiet" event
    const women100m = events.find(
      (e) =>
        e.name.includes("100") &&
        e.name.includes("kobiet") &&
        !e.name.includes("płotk")
    );

    if (women100m) {
      console.log('\n📊 "100 metrów kobiet" event analysis:');
      console.log(`   Event ID: ${women100m.id}`);
      console.log(`   Name: ${women100m.name}`);
      console.log(`   Category: ${women100m.category}`);
      console.log(`   Gender: ${women100m.gender}`);

      // Get registrations for this event
      const registrationsResponse = await axios.get(
        `${API_BASE}/registrations?competitionId=${competitionId}`,
        { headers }
      );

      const eventRegistrations = registrationsResponse.data.filter((reg) =>
        reg.events?.some((e) => e.eventId === women100m.id)
      );

      console.log(`   Registered athletes: ${eventRegistrations.length}`);

      // Analyze age categories of registered athletes
      const categoryCount = {};
      eventRegistrations.forEach((reg) => {
        const category = reg.athlete.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      console.log("   Age category distribution:");
      Object.entries(categoryCount).forEach(([cat, count]) => {
        console.log(`     ${cat}: ${count} athletes`);
      });

      // Show some examples
      console.log("   Example athletes:");
      eventRegistrations.slice(0, 5).forEach((reg) => {
        const athlete = reg.athlete;
        const birthYear = new Date(athlete.dateOfBirth).getFullYear();
        const age = 2025 - birthYear;
        console.log(
          `     ${athlete.firstName} ${athlete.lastName} (${birthYear}, age ${age}, ${athlete.category})`
        );
      });
    } else {
      console.log('❌ Could not find "100 metrów kobiet" event');
    }

    // 5. Check for duplicate events
    console.log("\n5️⃣ Checking for duplicate events...");
    const eventNames = events.map((e) => e.name);
    const duplicates = eventNames.filter(
      (name, index) => eventNames.indexOf(name) !== index
    );

    if (duplicates.length === 0) {
      console.log("✅ No duplicate events found - fix is working!");
    } else {
      console.log("❌ Duplicate events found:", [...new Set(duplicates)]);
    }

    // 6. Summary
    console.log("\n📋 SUMMARY:");
    console.log(`✅ Events created: ${events.length}`);
    console.log(`✅ Athletes imported: ${importResponse.data.importedCount}`);
    console.log(
      `✅ No duplicate events: ${duplicates.length === 0 ? "YES" : "NO"}`
    );

    if (women100m && women100m.category === "WIELE") {
      console.log("✅ Event category correctly set to WIELE");
    } else {
      console.log("❌ Event category not set to WIELE");
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

  await testCsvImportFix();
}

main().catch(console.error);
