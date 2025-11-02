const fs = require("fs");
const csv = require("csv-parser");

console.log("🔍 Testing CSV parsing");

const csvContent = `Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
33;11;K1500 m;1500 metrów kobiet;s;;;;415;BORKOWSKA;Aleksandra;2005-05-30;AZS UMCS Lublin;LU;02/LU/15;2025;;;;'4:31.19';4:31.19/25;;;;Z/0337/18;2025;109674;;;;;; ;KN B ;;2025-07-14 17:01:01;KITLIŃSKI Piotr;`;

// Zapisz do pliku tymczasowego
fs.writeFileSync("temp-test.csv", csvContent);

// Parsuj CSV
const results = [];
fs.createReadStream("temp-test.csv")
  .pipe(csv({ separator: ";" }))
  .on("data", (row) => {
    console.log("📊 Parsed row:");
    console.log("   Nazwisko:", row.Nazwisko);
    console.log("   Imię:", row.Imię);
    console.log("   SB:", `"${row.SB}"`);
    console.log("   PB:", `"${row.PB}"`);
    console.log("   Available columns:", Object.keys(row));
    results.push(row);
  })
  .on("end", () => {
    console.log("✅ CSV parsing completed");
    console.log(`   Total rows: ${results.length}`);

    // Cleanup
    fs.unlinkSync("temp-test.csv");
  });
