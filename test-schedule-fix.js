// Test sprawdzający czy naprawa harmonogramu działa

const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testScheduleFix() {
  console.log("=== TEST NAPRAWY HARMONOGRAMU ===\n");

  try {
    // 1. Sprawdź czy backend działa
    console.log("1. Sprawdzanie połączenia z backendem...");
    const healthCheck = await axios.get(`${API_BASE}/health`);
    console.log("✅ Backend działa:", healthCheck.status);

    // 2. Pobierz listę zawodów
    console.log("\n2. Pobieranie listy zawodów...");
    const competitionsResponse = await axios.get(`${API_BASE}/competitions`);
    const competitions = competitionsResponse.data;

    if (competitions.length === 0) {
      console.log("❌ Brak zawodów w systemie");
      return;
    }

    console.log(`✅ Znaleziono ${competitions.length} zawodów`);

    // 3. Sprawdź pierwszy zawody z harmonogramem
    for (const competition of competitions.slice(0, 3)) {
      console.log(`\n3. Sprawdzanie zawodów: ${competition.name}`);

      try {
        const scheduleResponse = await axios.get(
          `${API_BASE}/organization/schedules/competitions/${competition.id}/minute-program`
        );

        const minuteProgram = scheduleResponse.data;
        console.log(`✅ Program minutowy znaleziony`);

        // Sprawdź czasy w programie
        let hasInvalidTime = false;
        let maxTime = "00:00";

        for (const group of minuteProgram.timeGroups) {
          const time = group.time;

          // Sprawdź czy czas ma prawidłowy format HH:MM
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

          if (!timeRegex.test(time)) {
            console.log(`❌ Nieprawidłowy format czasu: ${time}`);
            hasInvalidTime = true;
          } else {
            // Sprawdź czy godzina nie przekracza 23
            const [hours, minutes] = time.split(":").map(Number);
            if (hours > 23) {
              console.log(`❌ Godzina przekracza 23: ${time}`);
              hasInvalidTime = true;
            }

            if (time > maxTime) {
              maxTime = time;
            }
          }
        }

        if (!hasInvalidTime) {
          console.log(`✅ Wszystkie czasy są prawidłowe (max: ${maxTime})`);
          console.log(`   Liczba pozycji: ${minuteProgram.timeGroups.length}`);
        }

        // Pokaż przykładowe czasy
        console.log("   Przykładowe czasy:");
        minuteProgram.timeGroups.slice(0, 5).forEach((group, i) => {
          console.log(`     ${group.time} - ${group.events.length} wydarzeń`);
        });

        if (minuteProgram.timeGroups.length > 5) {
          console.log("     ...");
          const lastGroups = minuteProgram.timeGroups.slice(-2);
          lastGroups.forEach((group) => {
            console.log(`     ${group.time} - ${group.events.length} wydarzeń`);
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("⚠️  Brak harmonogramu dla tych zawodów");
        } else {
          console.log(`❌ Błąd: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Błąd połączenia: ${error.message}`);
    console.log("💡 Upewnij się, że backend jest uruchomiony na porcie 3001");
  }
}

// Uruchom test
testScheduleFix()
  .then(() => {
    console.log("\n=== TEST ZAKOŃCZONY ===");
  })
  .catch((error) => {
    console.error("Błąd testu:", error.message);
  });
