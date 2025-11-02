const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function checkHurdlesAthletes() {
  try {
    console.log("🔐 Logging in...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    console.log("👥 Fetching all athletes...");
    const athletesResponse = await axios.get(`${API_BASE}/athletes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Szukaj zawodników z rekordami w płotkach (100MH)
    const hurdlesAthletes = athletesResponse.data.filter((athlete) => {
      const hasPB = athlete.personalBests && athlete.personalBests["100MH"];
      const hasSB = athlete.seasonBests && athlete.seasonBests["100MH"];
      return hasPB || hasSB;
    });

    console.log(
      `\n🏃‍♀️ Found ${hurdlesAthletes.length} athletes with 100MH records:`
    );

    hurdlesAthletes.forEach((athlete) => {
      console.log(
        `\n👤 ${athlete.firstName} ${athlete.lastName} (${athlete.club})`
      );
      if (athlete.personalBests && athlete.personalBests["100MH"]) {
        console.log(
          `   PB 100MH: ${JSON.stringify(athlete.personalBests["100MH"])}`
        );
      }
      if (athlete.seasonBests && athlete.seasonBests["100MH"]) {
        console.log(
          `   SB 100MH: ${JSON.stringify(athlete.seasonBests["100MH"])}`
        );
      }
    });

    // Sprawdź też inne możliwe klucze dla płotek
    console.log("\n🔍 Checking for other hurdles keys...");
    const allKeys = new Set();
    athletesResponse.data.forEach((athlete) => {
      if (athlete.personalBests) {
        Object.keys(athlete.personalBests).forEach((key) => allKeys.add(key));
      }
      if (athlete.seasonBests) {
        Object.keys(athlete.seasonBests).forEach((key) => allKeys.add(key));
      }
    });

    const hurdlesKeys = Array.from(allKeys).filter(
      (key) =>
        key.toLowerCase().includes("pł") ||
        key.toLowerCase().includes("hurdle") ||
        key.toLowerCase().includes("mh") ||
        (key.includes("100") && key.toLowerCase().includes("m"))
    );

    console.log("🏃‍♀️ Found hurdles-related keys:", hurdlesKeys);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
  }
}

checkHurdlesAthletes();
