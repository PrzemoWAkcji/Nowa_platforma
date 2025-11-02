const axios = require("axios");

async function testCompetitionsAPI() {
  try {
    console.log("🔍 Testowanie API zawodów...");

    // Test endpoint bez autoryzacji
    console.log("\n1. Test publicznego endpointu zawodów:");
    try {
      const publicResponse = await axios.get(
        "http://localhost:3001/competitions/public"
      );
      console.log(
        `✅ Publiczne zawody: ${publicResponse.data.length} znalezionych`
      );
      publicResponse.data.forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.name} (${comp.status})`);
      });
    } catch (error) {
      console.log(
        `❌ Błąd publicznego API: ${error.response?.status} - ${error.response?.statusText}`
      );
    }

    // Test endpoint z autoryzacją (bez tokenu)
    console.log("\n2. Test prywatnego endpointu zawodów (bez tokenu):");
    try {
      const privateResponse = await axios.get(
        "http://localhost:3001/competitions"
      );
      console.log(
        `✅ Prywatne zawody: ${privateResponse.data.length} znalezionych`
      );
    } catch (error) {
      console.log(
        `❌ Błąd prywatnego API: ${error.response?.status} - ${error.response?.statusText}`
      );
      if (error.response?.status === 401) {
        console.log("   (To jest oczekiwane - brak autoryzacji)");
      }
    }

    // Test logowania
    console.log("\n3. Test logowania:");
    try {
      const loginResponse = await axios.post(
        "http://localhost:3001/auth/login",
        {
          email: "organizer@athletics.pl",
          password: "password123",
        }
      );

      console.log("✅ Logowanie udane");
      const token = loginResponse.data.token;
      const user = loginResponse.data.user;
      console.log(`   Użytkownik: ${user.email} (${user.role})`);

      // Test endpoint z tokenem
      console.log("\n4. Test prywatnego endpointu z tokenem:");
      const authorizedResponse = await axios.get(
        "http://localhost:3001/competitions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        `✅ Autoryzowane zawody: ${authorizedResponse.data.length} znalezionych`
      );
      authorizedResponse.data.forEach((comp, index) => {
        console.log(
          `   ${index + 1}. ${comp.name} (${comp.status}) - utworzony przez: ${comp.createdById}`
        );
      });
    } catch (error) {
      console.log(
        `❌ Błąd logowania: ${error.response?.status} - ${error.response?.statusText}`
      );
      if (error.response?.data) {
        console.log(`   Szczegóły: ${JSON.stringify(error.response.data)}`);
      }
    }
  } catch (error) {
    console.error("❌ Ogólny błąd:", error.message);
  }
}

testCompetitionsAPI();
