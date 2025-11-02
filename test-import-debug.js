const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_BASE = "http://localhost:3001";

async function testImportDebug() {
  console.log("🔍 Testing Import Debug - Single athlete");

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
        name: "Debug Import Test",
        description: "Testing PB/SB import",
        startDate: "2025-08-01T10:00:00.000Z",
        endDate: "2025-08-01T18:00:00.000Z",
        location: "Test Stadium",
        type: "OUTDOOR",
      },
      { headers }
    );

    const competitionId = competitionResponse.data.id;
    console.log(`✅ Competition created: ${competitionId}`);

    // 3. Create a minimal CSV with just one athlete with PB/SB
    console.log("\n3️⃣ Creating test CSV...");
    const testCsvContent = `Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
33;11;K1500 m;1500 metrów kobiet;s;;;;415;BORKOWSKA;Aleksandra;2005-05-30;AZS UMCS Lublin;LU;02/LU/15;2025;;;;'4:31.19';4:31.19/25;;;;Z/0337/18;2025;109674;;;;;; ;KN B ;;2025-07-14 17:01:01;KITLIŃSKI Piotr;`;

    fs.writeFileSync("test-debug.csv", testCsvContent);

    // 4. Import the test CSV
    console.log("\n4️⃣ Importing test CSV...");
    const csvContent = fs.readFileSync("test-debug.csv");

    const formData = new FormData();
    formData.append("file", csvContent, {
      filename: "test-debug.csv",
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
    console.log(`   Errors:`, importResponse.data.errors || "none");

    // 5. Check the athlete
    console.log("\n5️⃣ Checking imported athlete...");
    const athletesResponse = await axios.get(`${API_BASE}/athletes`, {
      headers,
    });
    const athletes = athletesResponse.data;

    const borkowska = athletes.find((a) => a.lastName === "BORKOWSKA");
    if (borkowska) {
      console.log(`👤 ${borkowska.firstName} ${borkowska.lastName}:`);
      console.log(
        `   Personal Bests:`,
        JSON.stringify(borkowska.personalBests, null, 2)
      );
      console.log(
        `   Season Bests:`,
        JSON.stringify(borkowska.seasonBests, null, 2)
      );
    } else {
      console.log("❌ Could not find BORKOWSKA");
    }

    // 6. Check start list with records
    console.log("\n6️⃣ Checking start list...");
    const competitionDetailsResponse = await axios.get(
      `${API_BASE}/competitions/${competitionId}`,
      { headers }
    );
    const events = competitionDetailsResponse.data.events || [];
    const women1500m = events.find((e) => e.name.includes("1500"));

    if (women1500m) {
      const startListResponse = await axios.get(
        `${API_BASE}/registrations/start-list/${competitionId}/${women1500m.id}`,
        { headers }
      );

      const registrations = startListResponse.data;
      if (registrations.length > 0) {
        const reg = registrations[0];
        console.log(`📊 Start list record:`);
        console.log(
          `   Athlete: ${reg.athlete.displayName || reg.athlete.firstName + " " + reg.athlete.lastName}`
        );
        console.log(`   Records:`, JSON.stringify(reg.records, null, 2));
      }
    }

    console.log("\n🎉 Debug test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testImportDebug().catch(console.error);
