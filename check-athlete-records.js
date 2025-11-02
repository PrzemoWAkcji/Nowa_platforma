const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function checkAthleteRecords() {
  console.log("🔍 Checking athlete records in database");

  try {
    // 1. Login as admin
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Login successful");

    // 2. Get athletes
    console.log("\n2️⃣ Getting athletes...");
    const athletesResponse = await axios.get(`${API_BASE}/athletes`, {
      headers,
    });
    const athletes = athletesResponse.data;

    console.log(`✅ Found ${athletes.length} athletes`);

    // 3. Check specific athletes from 1500m women
    const targetAthletes = ["BORKOWSKA", "CHODUR", "MAŁEK", "PERYT"];

    console.log("\n3️⃣ Checking specific athletes...");

    for (const surname of targetAthletes) {
      const athlete = athletes.find((a) => a.lastName.includes(surname));
      if (athlete) {
        console.log(`\n👤 ${athlete.firstName} ${athlete.lastName}:`);
        console.log(`   Birth: ${new Date(athlete.dateOfBirth).getFullYear()}`);
        console.log(`   Category: ${athlete.category}`);
        console.log(`   Personal Bests:`, athlete.personalBests || "null");
        console.log(`   Season Bests:`, athlete.seasonBests || "null");

        // Check if they have any records for 1500M
        if (athlete.personalBests) {
          const pb1500 = athlete.personalBests["1500M"];
          console.log(`   1500M PB:`, pb1500 || "none");
        }
        if (athlete.seasonBests) {
          const sb1500 = athlete.seasonBests["1500M"];
          console.log(`   1500M SB:`, sb1500 || "none");
        }
      } else {
        console.log(`❌ Could not find athlete with surname: ${surname}`);
      }
    }

    // 4. Check CSV data for comparison
    console.log("\n4️⃣ Checking original CSV data...");
    const fs = require("fs");
    const csvContent = fs.readFileSync("2025-07-19_WARS.csv", "utf8");
    const lines = csvContent.split("\n");

    // Find 1500m women lines
    const women1500Lines = lines.filter(
      (line) => line.includes("K1500 m") || line.includes("1500 metrów kobiet")
    );

    console.log(`Found ${women1500Lines.length} lines for 1500m women in CSV`);

    // Show first few with PB/SB data
    console.log("\nSample CSV lines with PB/SB:");
    women1500Lines.slice(0, 5).forEach((line, i) => {
      const parts = line.split(";");
      if (parts.length > 20) {
        const surname = parts[9];
        const firstName = parts[10];
        const pb = parts[20]; // PB column
        const sb = parts[19]; // SB column
        console.log(
          `${i + 1}. ${firstName} ${surname}: PB="${pb}", SB="${sb}"`
        );
      }
    });

    console.log("\n🎉 Check completed!");
  } catch (error) {
    console.error("❌ Check failed:", error.response?.data || error.message);
  }
}

checkAthleteRecords().catch(console.error);
