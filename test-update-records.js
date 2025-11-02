const axios = require("axios");

async function testUpdateRecords() {
  console.log("🔍 Testing PB/SB Update from CSV Import...");

  try {
    // Login
    const loginResponse = await axios.post("http://localhost:3001/auth/login", {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Login successful");

    // Sprawdź obecne rekordy Justyny Święty-Ersetic
    console.log("\n🔍 Checking current records for Justyna Święty-Ersetic...");
    const athletesResponse = await axios.get("http://localhost:3001/athletes", {
      headers,
    });
    const justyna = athletesResponse.data.find(
      (a) => a.firstName === "Justyna" && a.lastName === "Święty-Ersetic"
    );

    if (justyna) {
      console.log(
        `👤 Current records for ${justyna.firstName} ${justyna.lastName}:`
      );
      console.log(`   PB: ${JSON.stringify(justyna.personalBests)}`);
      console.log(`   SB: ${JSON.stringify(justyna.seasonBests)}`);
    }

    // Stwórz zawody
    const competitionResponse = await axios.post(
      "http://localhost:3001/competitions",
      {
        name: "Test Update Records",
        description: "Testing PB/SB update",
        startDate: "2025-08-01T10:00:00.000Z",
        endDate: "2025-08-01T18:00:00.000Z",
        location: "Test Stadium",
        type: "OUTDOOR",
      },
      { headers }
    );

    const competitionId = competitionResponse.data.id;
    console.log(`\n✅ Competition created: ${competitionId}`);

    // Stwórz CSV z LEPSZYMI wynikami dla Justyny (obecny PB: 1:50.25, nowy: 1:48.50)
    const csvContent = `Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
33;11;K800 m;800 metrów kobiet;s;;;;415;ŚWIĘTY-ERSETIC;Justyna;1992-12-07;AZS AWF Katowice;SL;02/SL/15;2025;;;;'1:49.00';1:48.50;;;;Z/0337/18;2025;109674;;;;;; ;KN B ;;2025-07-18 17:01:01;KITLIŃSKI Piotr;`;

    console.log("\n📄 CSV with BETTER results:");
    console.log("   New SB: 1:49.00 (was 1:52.10)");
    console.log("   New PB: 1:48.50 (was 1:50.25)");

    // Import CSV
    const fs = require("fs");
    const FormData = require("form-data");

    fs.writeFileSync("test-update.csv", csvContent);
    const csvFile = fs.readFileSync("test-update.csv");

    const formData = new FormData();
    formData.append("file", csvFile, {
      filename: "test-update.csv",
      contentType: "text/csv",
    });
    formData.append("format", "PZLA");
    formData.append("updateExisting", "true");
    formData.append("createMissingAthletes", "false");

    console.log("\n🔄 Importing CSV with better results...");
    const importResponse = await axios.post(
      `http://localhost:3001/competitions/${competitionId}/import-startlist`,
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

    // Sprawdź zaktualizowane rekordy
    console.log("\n🔍 Checking UPDATED records...");
    const updatedAthletesResponse = await axios.get(
      "http://localhost:3001/athletes",
      { headers }
    );
    const updatedJustyna = updatedAthletesResponse.data.find(
      (a) => a.firstName === "Justyna" && a.lastName === "Święty-Ersetic"
    );

    if (updatedJustyna) {
      console.log(
        `👤 UPDATED records for ${updatedJustyna.firstName} ${updatedJustyna.lastName}:`
      );
      console.log(`   PB: ${JSON.stringify(updatedJustyna.personalBests)}`);
      console.log(`   SB: ${JSON.stringify(updatedJustyna.seasonBests)}`);

      // Sprawdź czy rekordy zostały zaktualizowane
      const pb800 = updatedJustyna.personalBests?.["800M"]?.result;
      const sb800 = updatedJustyna.seasonBests?.["800M"]?.result;

      console.log("\n📊 Update Results:");
      console.log(
        `   PB 800M: ${pb800} ${pb800 === "1:48.50" ? "✅ UPDATED!" : "❌ NOT UPDATED"}`
      );
      console.log(
        `   SB 800M: ${sb800} ${sb800 === "1:49.00" ? "✅ UPDATED!" : "❌ NOT UPDATED"}`
      );
    }

    // Cleanup
    fs.unlinkSync("test-update.csv");
    console.log("\n🎉 Test completed!");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testUpdateRecords();
