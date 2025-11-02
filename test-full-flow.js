const axios = require("axios");

async function testFullFlow() {
  console.log("🧪 Testowanie pełnego przepływu tworzenia zawodów...\n");

  try {
    // 1. Test logowania
    console.log("1️⃣ Test logowania...");
    const loginResponse = await axios.post("http://localhost:3001/auth/login", {
      email: "admin@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(
      `✅ Zalogowano jako: ${user.firstName} ${user.lastName} (${user.role})\n`
    );

    // 2. Test pobierania istniejących zawodów
    console.log("2️⃣ Test pobierania istniejących zawodów...");
    const competitionsResponse = await axios.get(
      "http://localhost:3001/competitions",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(
      `✅ Pobrano ${competitionsResponse.data.length} istniejących zawodów\n`
    );

    // 3. Test tworzenia nowych zawodów
    console.log("3️⃣ Test tworzenia nowych zawodów...");
    const newCompetition = {
      name: `Test Zawody ${new Date().toISOString().split("T")[0]}`,
      description: "Zawody utworzone przez test automatyczny",
      startDate: "2025-09-01T09:00:00.000Z",
      endDate: "2025-09-01T17:00:00.000Z",
      location: "Kraków",
      venue: "Stadion Testowy",
      type: "OUTDOOR",
      registrationStartDate: "2025-08-01T00:00:00.000Z",
      registrationEndDate: "2025-08-30T23:59:59.000Z",
      maxParticipants: 300,
      registrationFee: 30.0,
      isPublic: true,
      allowLateRegistration: false,
    };

    const createResponse = await axios.post(
      "http://localhost:3001/competitions",
      newCompetition,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const createdCompetition = createResponse.data;
    console.log(
      `✅ Utworzono zawody: "${createdCompetition.name}" (ID: ${createdCompetition.id})\n`
    );

    // 4. Test pobierania zawodów po utworzeniu
    console.log("4️⃣ Test pobierania zawodów po utworzeniu...");
    const updatedCompetitionsResponse = await axios.get(
      "http://localhost:3001/competitions",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(
      `✅ Teraz jest ${updatedCompetitionsResponse.data.length} zawodów (wzrost o ${updatedCompetitionsResponse.data.length - competitionsResponse.data.length})\n`
    );

    // 5. Test pobierania szczegółów utworzonych zawodów
    console.log("5️⃣ Test pobierania szczegółów utworzonych zawodów...");
    const competitionDetailsResponse = await axios.get(
      `http://localhost:3001/competitions/${createdCompetition.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const competitionDetails = competitionDetailsResponse.data;
    console.log(`✅ Pobrano szczegóły zawodów: "${competitionDetails.name}"`);
    console.log(`   Status: ${competitionDetails.status}`);
    console.log(`   Lokalizacja: ${competitionDetails.location}`);
    console.log(
      `   Data: ${new Date(competitionDetails.startDate).toLocaleDateString("pl-PL")}\n`
    );

    console.log("🎉 Wszystkie testy przeszły pomyślnie!");
    console.log("\n📋 Podsumowanie:");
    console.log(`   ✅ Logowanie działa`);
    console.log(`   ✅ Pobieranie zawodów działa`);
    console.log(`   ✅ Tworzenie zawodów działa`);
    console.log(`   ✅ Pobieranie szczegółów działa`);
    console.log(`   ✅ API jest w pełni funkcjonalne`);
  } catch (error) {
    console.error("❌ Test nie powiódł się!");
    console.error("Błąd:", error.response?.data || error.message);

    if (error.response) {
      console.error("\n📋 Szczegóły błędu:");
      console.error(`   Status: ${error.response.status}`);
      console.error(`   URL: ${error.config?.url}`);
      console.error(`   Method: ${error.config?.method?.toUpperCase()}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

testFullFlow();
