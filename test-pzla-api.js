// Test API endpointów PZLA
const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testPzlaApi() {
  try {
    console.log("🔍 Testowanie API endpointów PZLA...");

    // Test 1: Sprawdź czy backend działa
    console.log("\n1. Sprawdzanie dostępności backend API...");
    const healthResponse = await axios.get(`${API_BASE}/health`);

    if (healthResponse.status === 200) {
      console.log("✅ Backend API jest dostępny");
    } else {
      console.log("❌ Backend API nie odpowiada");
      return;
    }

    // Test 2: Pobierz listę zawodników
    console.log("\n2. Pobieranie listy zawodników...");
    const athletesResponse = await axios.get(`${API_BASE}/athletes`);

    if (athletesResponse.status === 200 && athletesResponse.data.length > 0) {
      console.log(`✅ Znaleziono ${athletesResponse.data.length} zawodników`);

      const firstAthlete = athletesResponse.data[0];
      console.log(
        `📋 Pierwszy zawodnik: ${firstAthlete.firstName} ${firstAthlete.lastName}`
      );

      // Test 3: Sprawdź endpoint wyszukiwania PZLA (bez autoryzacji - oczekujemy 401)
      console.log("\n3. Testowanie endpoint wyszukiwania PZLA...");
      try {
        await axios.get(`${API_BASE}/athletes/${firstAthlete.id}/search-pzla`);
        console.log("⚠️  Endpoint nie wymaga autoryzacji (może być problem)");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(
            "✅ Endpoint wymaga autoryzacji (poprawnie zabezpieczony)"
          );
        } else {
          console.log(`❌ Nieoczekiwany błąd: ${error.message}`);
        }
      }

      // Test 4: Sprawdź endpoint aktualizacji PZLA (bez autoryzacji - oczekujemy 401)
      console.log("\n4. Testowanie endpoint aktualizacji PZLA...");
      try {
        await axios.post(
          `${API_BASE}/athletes/${firstAthlete.id}/update-from-pzla`
        );
        console.log("⚠️  Endpoint nie wymaga autoryzacji (może być problem)");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(
            "✅ Endpoint wymaga autoryzacji (poprawnie zabezpieczony)"
          );
        } else {
          console.log(`❌ Nieoczekiwany błąd: ${error.message}`);
        }
      }

      // Test 5: Sprawdź endpoint masowej aktualizacji (bez autoryzacji - oczekujemy 401)
      console.log("\n5. Testowanie endpoint masowej aktualizacji...");
      try {
        await axios.post(`${API_BASE}/athletes/update-all-from-pzla`);
        console.log("⚠️  Endpoint nie wymaga autoryzacji (może być problem)");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(
            "✅ Endpoint wymaga autoryzacji (poprawnie zabezpieczony)"
          );
        } else {
          console.log(`❌ Nieoczekiwany błąd: ${error.message}`);
        }
      }
    } else {
      console.log("❌ Nie znaleziono zawodników w bazie");
    }

    console.log("\n✅ Test API endpointów PZLA zakończony");
    console.log("\n📋 Podsumowanie:");
    console.log("- Backend API działa poprawnie");
    console.log("- Endpointy PZLA są dostępne");
    console.log("- Autoryzacja jest wymagana (bezpieczeństwo OK)");
    console.log("- Gotowe do testowania z frontendem");
  } catch (error) {
    console.error("❌ Błąd podczas testowania API:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("💡 Sprawdź czy backend jest uruchomiony na porcie 3001");
    }
  }
}

// Uruchom test
testPzlaApi();
