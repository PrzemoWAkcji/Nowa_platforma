const fs = require("fs");
const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testPBSBImport() {
  console.log("🚀 Testing PB/SB import fix...");

  try {
    // 1. Login jako admin
    console.log("🔐 Logging in as admin...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    // 2. Sprawdź czy są zawody
    console.log("🏆 Checking competitions...");
    const competitionsResponse = await axios.get(`${API_BASE}/competitions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let competitionId;
    if (competitionsResponse.data.length === 0) {
      // Utwórz zawody testowe
      console.log("📝 Creating test competition...");
      const createCompResponse = await axios.post(
        `${API_BASE}/competitions`,
        {
          name: "Test Import PB/SB",
          description: "Test competition for PB/SB import",
          startDate: "2025-07-19",
          endDate: "2025-07-19",
          location: "Test Location",
          category: "SENIOR",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      competitionId = createCompResponse.data.id;
      console.log(`✅ Created competition: ${competitionId}`);
    } else {
      competitionId = competitionsResponse.data[0].id;
      console.log(`✅ Using existing competition: ${competitionId}`);
    }

    // 3. Przygotuj testowe dane CSV z płotkami
    console.log("📄 Preparing test CSV data...");
    const testCSV = `Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
33;28;K100 m pł;100 m pł kobiet;s;;;;966;TESTOWA;Anna;1997-01-10;Test Club;MZ;143/MZ/24;2025;;;;'15.20';15.20;;;;Z/1639/13;2025;44234;;;;;; ;;;2025-07-14 14:26:45;Test Coach;
33;28;K100 m pł;100 m pł kobiet;s;;;;711;TESTOWA2;Wiktoria;2006-02-03;Test Club 2;MZ;08/MZ/15;2025;;;;'14.05';14.05;;;;Z/0904/21;2025;119964;;;;;; ;;;2025-07-15 22:02:53;Test Coach 2;
33;2;K100 m;100 metrów kobiet;s;;;;500;TESTOWA3;Julia;2006-12-09;Test Club 3;MZ;36/MZ/15;2025;;;;'12.83';12.57;;;;Z/4297/19;2025;115841;;;;;; ;;;2025-07-08 20:04:03;Test Coach 3;`;

    // 4. Wykonaj import
    console.log("📤 Importing CSV data...");
    const importResponse = await axios.post(
      `${API_BASE}/competitions/${competitionId}/import-startlist-json`,
      {
        csvData: testCSV,
        format: "PZLA",
        updateExisting: true,
        createMissingAthletes: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "📊 Import result:",
      JSON.stringify(importResponse.data, null, 2)
    );

    if (importResponse.data.success) {
      console.log("✅ Import successful!");

      // 5. Sprawdź czy zawodniczki mają poprawnie zaimportowane PB/SB
      console.log("🔍 Checking athletes records...");
      const athletesResponse = await axios.get(`${API_BASE}/athletes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const testAthletes = athletesResponse.data.filter(
        (athlete) =>
          athlete.lastName &&
          (athlete.lastName.startsWith("TESTOWA") ||
            athlete.firstName.startsWith("TESTOWA"))
      );

      console.log(`\n📋 Found ${testAthletes.length} test athletes:`);

      for (const athlete of testAthletes) {
        console.log(`\n👤 ${athlete.firstName} ${athlete.lastName}:`);
        console.log(`   Club: ${athlete.club}`);
        console.log(
          `   Personal Bests:`,
          JSON.stringify(athlete.personalBests, null, 4)
        );
        console.log(
          `   Season Bests:`,
          JSON.stringify(athlete.seasonBests, null, 4)
        );

        // Sprawdź czy ma rekordy
        const hasPB =
          athlete.personalBests &&
          Object.keys(athlete.personalBests).length > 0;
        const hasSB =
          athlete.seasonBests && Object.keys(athlete.seasonBests).length > 0;

        if (hasPB || hasSB) {
          console.log(`   ✅ Records imported successfully!`);
        } else {
          console.log(`   ❌ No records found - import failed!`);
        }
      }

      // 6. Cleanup - usuń testowych zawodników
      console.log("\n🧹 Cleaning up test athletes...");
      for (const athlete of testAthletes) {
        try {
          await axios.delete(`${API_BASE}/athletes/${athlete.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`   ✅ Deleted ${athlete.firstName} ${athlete.lastName}`);
        } catch (error) {
          console.log(
            `   ⚠️ Could not delete ${athlete.firstName} ${athlete.lastName}: ${error.message}`
          );
        }
      }
    } else {
      console.log("❌ Import failed:", importResponse.data.message);
      console.log("Errors:", importResponse.data.errors);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

// Uruchom test
testPBSBImport();
