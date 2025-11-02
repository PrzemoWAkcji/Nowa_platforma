const axios = require("axios");

async function testFrontendAPI() {
  try {
    console.log("🔍 Testowanie API z perspektywy frontendu...");

    // Konfiguracja jak w frontendzie
    const api = axios.create({
      baseURL: "http://localhost:3001",
      withCredentials: true,
      timeout: 60000,
    });

    // 1. Test bez autoryzacji
    console.log("\n1. Test bez autoryzacji...");
    try {
      const response = await api.get("/competitions");
      console.log(`✅ Bez autoryzacji: ${response.data.length} zawodów`);
    } catch (error) {
      console.log(
        `❌ Bez autoryzacji: ${error.response?.status} - ${error.response?.statusText}`
      );
      if (error.response?.status === 401) {
        console.log("   (To jest oczekiwane - brak autoryzacji)");
      }
    }

    // 2. Zaloguj się
    console.log("\n2. Logowanie...");
    const loginResponse = await api.post("/auth/login", {
      email: "organizer@athletics.pl",
      password: "password123",
    });

    console.log("✅ Logowanie udane");
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Użytkownik: ${user.email} (${user.role})`);

    // 3. Test z tokenem w nagłówku
    console.log("\n3. Test z tokenem w nagłówku...");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const competitionsResponse = await api.get("/competitions");
    console.log(`✅ Z tokenem: ${competitionsResponse.data.length} zawodów`);

    competitionsResponse.data.forEach((comp, index) => {
      console.log(`   ${index + 1}. ${comp.name} (${comp.status})`);
      console.log(`      Utworzony przez: ${comp.createdById}`);
      console.log(`      Użytkownik ID: ${user.id}`);
      console.log(
        `      Czy to zawody użytkownika: ${comp.createdById === user.id ? "✅" : "❌"}`
      );
    });

    // 4. Filtrowanie zawodów organizatora
    console.log("\n4. Filtrowanie zawodów organizatora...");
    const userCompetitions = competitionsResponse.data.filter(
      (c) => c.createdById === user.id
    );
    console.log(`   Zawody organizatora: ${userCompetitions.length}`);

    if (userCompetitions.length === 0) {
      console.log("   ⚠️  PROBLEM: Brak zawodów dla tego organizatora!");
      console.log("   Sprawdzenie wszystkich zawodów:");
      competitionsResponse.data.forEach((comp, index) => {
        console.log(
          `     ${index + 1}. ${comp.name} - createdById: ${comp.createdById}`
        );
      });
      console.log(`   ID zalogowanego użytkownika: ${user.id}`);
    }

    // 5. Test endpoint publiczny (jak na stronie głównej)
    console.log("\n5. Test endpoint publiczny...");
    const publicResponse = await axios.get(
      "http://localhost:3001/competitions/public"
    );
    console.log(`✅ Publiczne zawody: ${publicResponse.data.length}`);

    if (publicResponse.data.length > 0) {
      const firstComp = publicResponse.data[0];
      console.log("\n📋 Struktura pierwszych zawodów:");
      console.log("- id:", firstComp.id);
      console.log("- name:", firstComp.name);
      console.log("- location:", firstComp.location);
      console.log("- status:", firstComp.status);
      console.log("- startDate:", firstComp.startDate);
      console.log("- endDate:", firstComp.endDate);
      console.log("- isPublic:", firstComp.isPublic);
      console.log("- liveResultsEnabled:", firstComp.liveResultsEnabled);
      console.log("- maxParticipants:", firstComp.maxParticipants);
      console.log("- _count:", firstComp._count);
    }

    console.log("\n✅ Test frontend API zakończony!");
  } catch (error) {
    console.error("❌ Błąd:", error.response?.data || error.message);
  }
}

testFrontendAPI();
