const axios = require("axios");

async function testCreateCompetition() {
  try {
    console.log("🔐 Logowanie...");

    // Logowanie
    const loginResponse = await axios.post("http://localhost:3001/auth/login", {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Zalogowano pomyślnie");

    // Tworzenie zawodów
    console.log("🏃 Tworzenie zawodów...");

    const competitionData = {
      name: "Test Zawody 2025",
      description: "Testowe zawody utworzone przez skrypt",
      startDate: "2025-08-01T10:00:00.000Z",
      endDate: "2025-08-01T18:00:00.000Z",
      location: "Warszawa",
      venue: "Stadion Narodowy",
      type: "OUTDOOR",
      registrationStartDate: "2025-07-01T00:00:00.000Z",
      registrationEndDate: "2025-07-30T23:59:59.000Z",
      maxParticipants: 500,
      registrationFee: 50.0,
      isPublic: true,
      allowLateRegistration: false,
    };

    const createResponse = await axios.post(
      "http://localhost:3001/competitions",
      competitionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Zawody utworzone pomyślnie!");
    console.log(
      "📋 Dane zawodów:",
      JSON.stringify(createResponse.data, null, 2)
    );
  } catch (error) {
    console.error("❌ Błąd:", error.response?.data || error.message);
    if (error.response?.data) {
      console.error(
        "📋 Szczegóły błędu:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
  }
}

testCreateCompetition();
