const fs = require("fs");

async function debugImport() {
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

    // Read a small sample of CSV
    const csvData = fs.readFileSync("2025-07-19_WARS.csv", "utf-8");
    const lines = csvData.split("\n");
    const sampleCSV = lines.slice(0, 5).join("\n"); // Just first 5 lines

    console.log("📋 Sample CSV data:");
    console.log(sampleCSV);
    console.log("\n📏 Sample CSV length:", sampleCSV.length);

    // Try import with sample
    console.log("\n📥 Testing import with sample data...");
    const importResponse = await fetch(
      `${API_BASE}/competitions/${competition.id}/import-startlist-json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          csvData: sampleCSV,
          format: "PZLA",
        }),
      }
    );

    console.log("📊 Import response status:", importResponse.status);

    if (importResponse.ok) {
      const result = await importResponse.json();
      console.log("✅ Import result:", JSON.stringify(result, null, 2));
    } else {
      const error = await importResponse.text();
      console.log("❌ Import error:", error);
    }
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugImport();
