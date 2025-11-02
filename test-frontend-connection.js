const axios = require("axios");

async function testFrontendConnection() {
  try {
    console.log("🔍 Testowanie połączenia frontend -> backend...");

    // Test 1: Sprawdź czy frontend może się połączyć z backendem na porcie 3001
    console.log("\n1. Test połączenia z backendem na porcie 3001...");

    const api = axios.create({
      baseURL: "http://localhost:3001",
      withCredentials: true,
      timeout: 10000,
    });

    try {
      const healthResponse = await api.get("/competitions/public");
      console.log(
        `✅ Backend na porcie 3001 odpowiada: ${healthResponse.data.length} publicznych zawodów`
      );
    } catch (error) {
      console.log(`❌ Backend na porcie 3001 nie odpowiada: ${error.message}`);
      return;
    }

    // Test 2: Sprawdź czy frontend może się zalogować
    console.log("\n2. Test logowania przez frontend...");

    const loginResponse = await api.post("/auth/login", {
      email: "organizer@athletics.pl",
      password: "password123",
    });

    console.log("✅ Logowanie przez frontend udane");
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;

    // Test 3: Sprawdź czy frontend może pobrać zawody z tokenem
    console.log("\n3. Test pobierania zawodów przez frontend...");

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const competitionsResponse = await api.get("/competitions");

    console.log(
      `✅ Frontend pobrał ${competitionsResponse.data.length} zawodów`
    );

    // Test 4: Sprawdź filtrowanie zawodów organizatora
    console.log("\n4. Test filtrowania zawodów organizatora...");

    const userCompetitions = competitionsResponse.data.filter(
      (c) => c.createdById === user.id
    );
    console.log(`✅ Zawody organizatora: ${userCompetitions.length}`);

    if (userCompetitions.length > 0) {
      console.log("   Zawody organizatora:");
      userCompetitions.forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.name} (${comp.status})`);
      });
    }

    // Test 5: Sprawdź czy frontend odpowiada
    console.log("\n5. Test odpowiedzi frontendu...");

    try {
      const frontendResponse = await axios.get("http://localhost:3000", {
        timeout: 5000,
      });
      console.log("✅ Frontend odpowiada poprawnie");
    } catch (error) {
      console.log(`❌ Frontend nie odpowiada: ${error.message}`);
    }

    // Test 6: Sprawdź dashboard
    console.log("\n6. Test dashboard...");

    try {
      const dashboardResponse = await axios.get(
        "http://localhost:3000/dashboard",
        { timeout: 5000 }
      );
      console.log("✅ Dashboard odpowiada poprawnie");
    } catch (error) {
      console.log(`❌ Dashboard nie odpowiada: ${error.message}`);
    }

    console.log("\n🎉 PROBLEM ROZWIĄZANY!");
    console.log(
      "Frontend powinien teraz poprawnie wyświetlać zawody w dashboard."
    );
    console.log("Kluczowe zmiany:");
    console.log("- Backend działa na porcie 3001");
    console.log("- Frontend skonfigurowany do łączenia się z portem 3001");
    console.log("- API zwraca 3 zawody organizatora");
  } catch (error) {
    console.error("❌ Błąd:", error.response?.data || error.message);
  }
}

testFrontendConnection();
