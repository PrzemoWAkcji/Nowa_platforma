const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function testSimpleCSV() {
  console.log("🔍 Testing simple CSV import...");

  try {
    // Login
    const loginResponse = await axios.post("http://localhost:3001/auth/login", {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Login successful");

    // Stwórz zawody
    const competitionResponse = await axios.post(
      "http://localhost:3001/competitions",
      {
        name: "Test Simple CSV",
        description: "Testing simple CSV",
        startDate: "2025-08-01T10:00:00.000Z",
        endDate: "2025-08-01T18:00:00.000Z",
        location: "Test Stadium",
        type: "OUTDOOR",
      },
      { headers }
    );

    const competitionId = competitionResponse.data.id;
    console.log(`✅ Competition created: ${competitionId}`);

    // Stwórz bardzo prosty CSV z jednym zawodnikiem
    const csvContent = `Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
33;11;K800 m;800 metrów kobiet;s;;;;415;ŚWIĘTY-ERSETIC;Justyna;1992-12-07;AZS AWF Katowice;SL;02/SL/15;2025;;;;1:49.00;1:48.50;;;;Z/0337/18;2025;109674;;;;;; ;KN B ;;2025-07-18 17:01:01;KITLIŃSKI Piotr;`;

    console.log("\n📄 Simple CSV (without apostrophes):");
    console.log("   SB: 1:49.00");
    console.log("   PB: 1:48.50");

    // Import CSV
    fs.writeFileSync("test-simple.csv", csvContent);
    const csvFile = fs.readFileSync("test-simple.csv");

    const formData = new FormData();
    formData.append("file", csvFile, {
      filename: "test-simple.csv",
      contentType: "text/csv",
    });
    formData.append("format", "PZLA");
    formData.append("updateExisting", "true");
    formData.append("createMissingAthletes", "false");

    console.log("\n🔄 Importing simple CSV...");
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

    // Cleanup
    fs.unlinkSync("test-simple.csv");
    console.log("\n🎉 Test completed!");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testSimpleCSV();
