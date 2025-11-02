const fs = require("fs");

async function testBatchImport() {
  try {
    const API_BASE = "http://localhost:3001";

    // Login
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@athletics.pl",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Get competitions
    const competitionsResponse = await fetch(`${API_BASE}/competitions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const competitions = await competitionsResponse.json();
    const competition = competitions[0];

    // Read full CSV and split into batches
    const csvData = fs.readFileSync("2025-07-19_WARS.csv", "utf-8");
    const lines = csvData.split("\n");
    const header = lines[0];
    const dataLines = lines.slice(1);

    console.log(`📊 Total data lines: ${dataLines.length}`);

    const batchSize = 50; // Process 50 athletes at a time
    const batches = [];

    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batchLines = dataLines.slice(i, i + batchSize);
      const batchCSV = header + "\n" + batchLines.join("\n");
      batches.push(batchCSV);
    }

    console.log(
      `📦 Created ${batches.length} batches of ${batchSize} athletes each`
    );

    let totalImported = 0;
    let totalErrors = 0;

    for (let i = 0; i < batches.length; i++) {
      console.log(`\n📥 Processing batch ${i + 1}/${batches.length}...`);

      try {
        const importResponse = await fetch(
          `${API_BASE}/competitions/${competition.id}/import-startlist-json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              csvData: batches[i],
              format: "PZLA",
            }),
          }
        );

        if (importResponse.ok) {
          const result = await importResponse.json();
          console.log(
            `✅ Batch ${i + 1}: Imported ${result.importedCount} athletes`
          );
          totalImported += result.importedCount;

          if (result.errors && result.errors.length > 0) {
            console.log(`⚠️ Batch ${i + 1} errors: ${result.errors.length}`);
            totalErrors += result.errors.length;
          }
        } else {
          const error = await importResponse.text();
          console.log(`❌ Batch ${i + 1} failed:`, error);
          totalErrors++;
        }

        // Small delay between batches to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`❌ Batch ${i + 1} error:`, error.message);
        totalErrors++;
      }
    }

    console.log(`\n🎉 Batch import completed!`);
    console.log(`📊 Total imported: ${totalImported} athletes`);
    console.log(`❌ Total errors: ${totalErrors}`);
  } catch (error) {
    console.error("❌ Batch import failed:", error.message);
  }
}

testBatchImport();
