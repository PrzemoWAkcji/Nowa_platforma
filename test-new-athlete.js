const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_BASE = "http://localhost:3001";

async function testNewAthlete() {
  console.log("🔍 Testing New Athlete Import");

  try {
    // 1. Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Login successful");

    // 2. Create test competition
    console.log("\n2️⃣ Creating test competition...");
    const competitionData = {
      name: "Test Competition for New Athlete",
      description: "Test competition",
      startDate: "2025-07-20T10:00:00.000Z",
      endDate: "2025-07-20T18:00:00.000Z",
      location: "Test Location",
      venue: "Test Venue",
      type: "OUTDOOR",
      registrationStartDate: "2025-07-18T00:00:00.000Z",
      registrationEndDate: "2025-07-19T23:59:59.000Z",
      maxParticipants: 100,
      isPublic: true,
      allowLateRegistration: false,
    };

    const competitionResponse = await axios.post(
      `${API_BASE}/competitions`,
      competitionData,
      { headers }
    );
    const competitionId = competitionResponse.data.id;
    console.log(`✅ Competition created: ${competitionId}`);

    // 3. Create CSV with completely new athlete
    console.log("\n3️⃣ Creating test CSV with new athlete...");
    const csvContent = `Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
33;11;K1500 m;1500 metrów kobiet;s;;;;416;TESTOWA;Anna;2000-01-01;Test Club;MZ;99/MZ/99;2025;;;;'4:25.50';4:20.30;;;;Z/9999/99;2025;999999;;;;;; ;TEST ;;2025-07-18 12:00:00;TEST Trener;`;

    fs.writeFileSync("test-new-athlete.csv", csvContent);

    // 4. Import CSV
    console.log("\n4️⃣ Importing test CSV...");
    const csvFileContent = fs.readFileSync("test-new-athlete.csv");

    const formData = new FormData();
    formData.append("file", csvFileContent, {
      filename: "test-new-athlete.csv",
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
    console.log(`   Errors:`, importResponse.data.errors);

    // 5. Check if new athlete was created
    console.log("\n5️⃣ Checking new athlete...");
    const athletesResponse = await axios.get(`${API_BASE}/athletes`, {
      headers,
    });
    // Show last 5 athletes to see if Anna was created
    console.log("📊 Last 5 athletes:");
    const lastAthletes = athletesResponse.data.slice(-5);
    lastAthletes.forEach((athlete) => {
      console.log(
        `   - ${athlete.firstName} ${athlete.lastName} (ID: ${athlete.id})`
      );
    });

    const anna = athletesResponse.data.find(
      (a) => a.firstName === "Anna" && a.lastName === "TESTOWA"
    );

    if (anna) {
      console.log("\n👤 Anna TESTOWA:");
      console.log("   ID:", anna.id);
      console.log("   Personal Bests:", anna.personalBests);
      console.log("   Season Bests:", anna.seasonBests);
      console.log("   Full record:", JSON.stringify(anna, null, 2));
    } else {
      console.log("\n❌ Anna TESTOWA not found");

      // Try to find by partial name
      const partialMatch = athletesResponse.data.find(
        (a) => a.firstName.includes("Anna") || a.lastName.includes("TESTOWA")
      );
      if (partialMatch) {
        console.log(
          "🔍 Found partial match:",
          partialMatch.firstName,
          partialMatch.lastName
        );
      }
    }

    // Cleanup
    fs.unlinkSync("test-new-athlete.csv");
    console.log("\n🎉 Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testNewAthlete();
