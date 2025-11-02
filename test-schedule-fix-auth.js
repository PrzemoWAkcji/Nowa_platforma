// Test sprawdzający czy naprawa harmonogramu działa (z autoryzacją)

const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testScheduleFixWithAuth() {
  console.log("=== TEST NAPRAWY HARMONOGRAMU (Z AUTORYZACJĄ) ===\n");

  try {
    // 1. Zaloguj się jako organizer
    console.log("1. Logowanie jako organizer...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "organizer@athletics.pl",
      password: "password123",
    });

    const token = loginResponse.data.access_token;
    console.log("✅ Zalogowano pomyślnie");

    // Konfiguracja nagłówków z tokenem
    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // 2. Pobierz listę zawodów
    console.log("\n2. Pobieranie listy zawodów...");
    const competitionsResponse = await axios.get(`${API_BASE}/competitions`, {
      headers: authHeaders,
    });
    const competitions = competitionsResponse.data;

    if (competitions.length === 0) {
      console.log("❌ Brak zawodów w systemie");
      return;
    }

    console.log(`✅ Znaleziono ${competitions.length} zawodów`);

    // 3. Sprawdź zawody z harmonogramem
    for (const competition of competitions.slice(0, 3)) {
      console.log(`\n3. Sprawdzanie zawodów: ${competition.name}`);

      try {
        // Najpierw sprawdź czy istnieją wydarzenia dla tych zawodów
        const eventsResponse = await axios.get(
          `${API_BASE}/events?competitionId=${competition.id}`,
          { headers: authHeaders }
        );

        if (eventsResponse.data.length === 0) {
          console.log("⚠️  Brak wydarzeń dla tych zawodów");
          continue;
        }

        console.log(`   Znaleziono ${eventsResponse.data.length} wydarzeń`);

        // Spróbuj wygenerować harmonogram
        try {
          const generateResponse = await axios.post(
            `${API_BASE}/organization/schedules/competitions/${competition.id}/generate`,
            {
              startTime: new Date().toISOString(),
              breakDuration: 15,
              parallelFieldEvents: true,
              separateCombinedEvents: true,
            },
            { headers: authHeaders }
          );

          console.log("✅ Harmonogram wygenerowany");
        } catch (genError) {
          if (genError.response?.status === 409) {
            console.log("⚠️  Harmonogram już istnieje");
          } else {
            console.log(
              `⚠️  Błąd generowania: ${genError.response?.data?.message || genError.message}`
            );
          }
        }

        // Sprawdź program minutowy
        const scheduleResponse = await axios.get(
          `${API_BASE}/organization/schedules/competitions/${competition.id}/minute-program`,
          { headers: authHeaders }
        );

        const minuteProgram = scheduleResponse.data;
        console.log(`✅ Program minutowy znaleziony`);

        // Sprawdź czasy w programie
        let hasInvalidTime = false;
        let maxTime = "00:00";
        let invalidTimes = [];

        for (const group of minuteProgram.timeGroups) {
          const time = group.time;

          // Sprawdź czy czas ma prawidłowy format HH:MM
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

          if (!timeRegex.test(time)) {
            console.log(`❌ Nieprawidłowy format czasu: ${time}`);
            hasInvalidTime = true;
            invalidTimes.push(time);
          } else {
            // Sprawdź czy godzina nie przekracza 23
            const [hours, minutes] = time.split(":").map(Number);
            if (hours > 23) {
              console.log(`❌ Godzina przekracza 23: ${time}`);
              hasInvalidTime = true;
              invalidTimes.push(time);
            }

            if (time > maxTime) {
              maxTime = time;
            }
          }
        }

        if (!hasInvalidTime) {
          console.log(`✅ Wszystkie czasy są prawidłowe (max: ${maxTime})`);
          console.log(`   Liczba pozycji: ${minuteProgram.timeGroups.length}`);
        } else {
          console.log(
            `❌ Znaleziono ${invalidTimes.length} nieprawidłowych czasów:`
          );
          invalidTimes.forEach((time) => console.log(`     ${time}`));
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
          console.log(
            `❌ Błąd: ${error.response?.data?.message || error.message}`
          );
        }
      }
    }
  } catch (error) {
    console.log(`❌ Błąd: ${error.response?.data?.message || error.message}`);
  }
}

// Uruchom test
testScheduleFixWithAuth()
  .then(() => {
    console.log("\n=== TEST ZAKOŃCZONY ===");
    console.log(
      "🎯 Jeśli wszystkie czasy są w formacie HH:MM (0-23), naprawa działa!"
    );
  })
  .catch((error) => {
    console.error("Błąd testu:", error.message);
  });
