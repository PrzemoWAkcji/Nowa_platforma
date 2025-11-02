const fs = require("fs");

async function testSimpleImport() {
  try {
    const API_BASE = "http://localhost:3001";

    console.log("🔐 Logowanie...");

    // 1. Login
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@athletics.pl",
        password: "password123",
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Login failed: ${error}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log("✅ Logged in successfully");

    // 2. Get existing competitions
    console.log("🏆 Fetching existing competitions...");
    const competitionsResponse = await fetch(`${API_BASE}/competitions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!competitionsResponse.ok) {
      throw new Error("Failed to fetch competitions");
    }

    const competitions = await competitionsResponse.json();
    console.log(`✅ Found ${competitions.length} competitions`);

    if (competitions.length === 0) {
      throw new Error("No competitions found");
    }

    const competition = competitions[0];
    console.log(
      `📍 Using competition: ${competition.name} (ID: ${competition.id})`
    );

    // 3. Read CSV file
    console.log("📁 Reading CSV file...");
    const csvData = fs.readFileSync("2025-07-19_WARS.csv", "utf-8");
    console.log(`✅ CSV loaded (${csvData.length} characters)`);

    // 4. Import startlist
    console.log("📥 Importing startlist...");
    const importResponse = await fetch(
      `${API_BASE}/competitions/${competition.id}/import-startlist-json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          csvData: csvData,
          format: "PZLA",
        }),
      }
    );

    if (!importResponse.ok) {
      const error = await importResponse.text();
      console.log("❌ Import failed:", error);
      return;
    }

    const importResult = await importResponse.json();
    console.log("✅ Import completed!");
    console.log("📊 Import results:");
    console.log("   - Success:", importResult.success);
    console.log("   - Message:", importResult.message);
    console.log("   - Imported:", importResult.importedCount);
    console.log("   - Updated:", importResult.updatedCount);
    console.log("   - Skipped:", importResult.skippedCount);
    console.log("   - Detected format:", importResult.detectedFormat);

    if (importResult.errors && importResult.errors.length > 0) {
      console.log("❌ Errors:");
      importResult.errors
        .slice(0, 5)
        .forEach((error) => console.log("   -", error));
      if (importResult.errors.length > 5) {
        console.log(`   ... and ${importResult.errors.length - 5} more errors`);
      }
    }

    if (importResult.warnings && importResult.warnings.length > 0) {
      console.log("⚠️ Warnings:");
      importResult.warnings
        .slice(0, 5)
        .forEach((warning) => console.log("   -", warning));
      if (importResult.warnings.length > 5) {
        console.log(
          `   ... and ${importResult.warnings.length - 5} more warnings`
        );
      }
    }

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testSimpleImport();
