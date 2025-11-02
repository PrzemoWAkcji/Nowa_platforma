const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_BASE = "http://localhost:3001";

async function testRealImport() {
  console.log("🔍 Testing Real Import with Anna LOZOVYTSKA");

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
        name: "Anna LOZOVYTSKA Import Test",
        description: "Testing PB/SB import for Anna",
        startDate: "2025-08-01T10:00:00.000Z",
        endDate: "2025-08-01T18:00:00.000Z",
        location: "Test Stadium",
        type: "OUTDOOR",
      },
      { headers }
    );

    const competitionId = competitionResponse.data.id;
    console.log(`✅ Competition created: ${competitionId}`);

    // 3. Create CSV with Anna LOZOVYTSKA data (with proper encoding)
    console.log("\n3️⃣ Creating test CSV with Anna LOZOVYTSKA...");
    const testCsvContent = `Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
33;28;K100 m pł;100 m pł kobiet;s;;;;244;LOZOVYTSKA;Anna;2005-12-22;KS AZS AWF Warszawa;MZ;01/MZ/15;2025;;;;'14.23';14.23/25;;;;Z/3629/22;2025;141419;;;;;; ;KN B ;;2025-07-16 11:14:34;RZEPKA Marek;`;

    fs.writeFileSync("test-anna.csv", testCsvContent, "utf8");

    // 4. Import the test CSV
    console.log("\n4️⃣ Importing test CSV...");
    const csvContent = fs.readFileSync("test-anna.csv");

    const formData = new FormData();
    formData.append("file", csvContent, {
      filename: "test-anna.csv",
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

    // 5. Check Anna LOZOVYTSKA
    console.log("\n5️⃣ Checking Anna LOZOVYTSKA...");
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

    console.log("\n🎉 Real import test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testRealImport().catch(console.error);
