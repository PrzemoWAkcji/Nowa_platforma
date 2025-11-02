const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_BASE = "http://localhost:3001";

async function testOriginalFile() {
  console.log("🔍 Testing Original File Import");

  try {
    // 1. Login as admin
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Login successful");

    // 2. Create a test competition
    console.log("\n2️⃣ Creating test competition...");
    const competitionResponse = await axios.post(
      `${API_BASE}/competitions`,
      {
        name: "Original File Import Test",
        description: "Testing original CSV file import",
        startDate: "2025-08-01T10:00:00.000Z",
        endDate: "2025-08-01T18:00:00.000Z",
        location: "Test Stadium",
        type: "OUTDOOR",
      },
      { headers }
    );

    const competitionId = competitionResponse.data.id;
    console.log(`✅ Competition created: ${competitionId}`);

    // 3. Import the original CSV file
    console.log("\n3️⃣ Importing original CSV file...");
    const originalFilePath = "c:/nowa platforma/2025-07-19_WARS.csv";

    if (!fs.existsSync(originalFilePath)) {
      console.log("❌ Original file does not exist:", originalFilePath);
      return;
    }

    const csvContent = fs.readFileSync(originalFilePath);

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
    console.log(`   Errors: ${importResponse.data.errors?.length || 0} errors`);

    if (importResponse.data.errors && importResponse.data.errors.length > 0) {
      console.log("   First few errors:");
      importResponse.data.errors.slice(0, 5).forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    }

    // 4. Check Anna LOZOVYTSKA specifically
    console.log("\n4️⃣ Checking Anna LOZOVYTSKA...");
    const athletesResponse = await axios.get(`${API_BASE}/athletes`, {
      headers,
    });
    const athletes = athletesResponse.data;

    const anna = athletes.find(
      (a) => a.lastName === "LOZOVYTSKA" && a.firstName === "Anna"
    );
    if (anna) {
      console.log(`👤 ${anna.firstName} ${anna.lastName}:`);
      console.log(
        `   Personal Bests:`,
        JSON.stringify(anna.personalBests, null, 2)
      );
      console.log(
        `   Season Bests:`,
        JSON.stringify(anna.seasonBests, null, 2)
      );

      // Sprawdź czy ma rekord w 100MH
      const pb = anna.personalBests || {};
      const sb = anna.seasonBests || {};

      if (pb["100MH"]) {
        console.log("✅ Anna has PB in 100MH:", pb["100MH"]);
      } else {
        console.log("❌ Anna does NOT have PB in 100MH");
        console.log("   Available PB keys:", Object.keys(pb));
      }

      if (sb["100MH"]) {
        console.log("✅ Anna has SB in 100MH:", sb["100MH"]);
      } else {
        console.log("❌ Anna does NOT have SB in 100MH");
        console.log("   Available SB keys:", Object.keys(sb));
      }
    } else {
      console.log("❌ Could not find Anna LOZOVYTSKA");
    }

    console.log("\n🎉 Original file import test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error("   Details:", error.response.data.details);
    }
  }
}

testOriginalFile().catch(console.error);
