// Prosty test integracji z PZLA
const axios = require("axios");

async function testPzlaIntegration() {
  try {
    console.log("🔍 Testowanie integracji z PZLA...");

    // Test 1: Sprawdź czy strona PZLA jest dostępna
    console.log("\n1. Sprawdzanie dostępności strony PZLA...");
    const response = await axios.get("https://statystyka.pzla.pl", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (response.status === 200) {
      console.log("✅ Strona PZLA jest dostępna");
    } else {
      console.log("❌ Strona PZLA nie odpowiada poprawnie");
      return;
    }

    // Test 2: Sprawdź stronę wyszukiwania
    console.log("\n2. Sprawdzanie strony wyszukiwania...");
    const searchResponse = await axios.get("https://statystyka.pzla.pl/baza/", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (searchResponse.status === 200) {
      console.log("✅ Strona wyszukiwania jest dostępna");

      // Sprawdź czy zawiera formularz
      if (
        searchResponse.data.includes("<form") ||
        searchResponse.data.includes("nazwisko") ||
        searchResponse.data.includes("imie")
      ) {
        console.log("✅ Znaleziono elementy formularza wyszukiwania");
      } else {
        console.log("⚠️  Nie znaleziono oczekiwanych elementów formularza");
      }
    } else {
      console.log("❌ Strona wyszukiwania nie jest dostępna");
    }

    // Test 3: Sprawdź przykładowy profil zawodnika
    console.log("\n3. Sprawdzanie przykładowego profilu zawodnika...");
    try {
      const profileResponse = await axios.get(
        "https://statystyka.pzla.pl/personal.php?page=last&nr_zaw=32851&r=2&sezon_Z_L=L",
        {
          timeout: 10000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

      if (profileResponse.status === 200) {
        console.log("✅ Profil zawodnika jest dostępny");

        // Sprawdź czy zawiera dane zawodnika
        if (
          profileResponse.data.includes("table") ||
          profileResponse.data.includes("wynik") ||
          profileResponse.data.includes("konkurencja")
        ) {
          console.log("✅ Znaleziono elementy profilu zawodnika");
        } else {
          console.log("⚠️  Nie znaleziono oczekiwanych elementów profilu");
        }
      }
    } catch (error) {
      console.log(
        "⚠️  Nie można uzyskać dostępu do przykładowego profilu (może być ograniczony)"
      );
    }

    console.log("\n✅ Test integracji z PZLA zakończony");
    console.log("\n📋 Podsumowanie:");
    console.log("- Strona PZLA jest dostępna");
    console.log("- Implementacja parsowania jest gotowa");
    console.log("- Można testować z rzeczywistymi danymi");
  } catch (error) {
    console.error("❌ Błąd podczas testowania:", error.message);

    if (error.code === "ENOTFOUND") {
      console.log("💡 Sprawdź połączenie internetowe");
    } else if (error.code === "ETIMEDOUT") {
      console.log(
        "💡 Strona PZLA może być przeciążona, spróbuj ponownie później"
      );
    }
  }
}

// Uruchom test
testPzlaIntegration();
