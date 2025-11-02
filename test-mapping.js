// Test mapowania danych z API na format strony głównej
const axios = require("axios");

// Skopiuj funkcję mapowania z frontendu
const mapApiCompetitionToLocal = (apiComp) => {
  // Określ kategorię na podstawie nazwy zawodów
  let category = "Mistrzostwa";
  if (apiComp.name.toLowerCase().includes("memoriał")) {
    category = "Memoriał";
  } else if (
    apiComp.name.toLowerCase().includes("młodzież") ||
    apiComp.name.toLowerCase().includes("junior")
  ) {
    category = "Młodzież";
  } else if (apiComp.name.toLowerCase().includes("bieg")) {
    category = "Bieg";
  }

  return {
    id: apiComp.id,
    name: apiComp.name,
    location: apiComp.location,
    startDate: apiComp.startDate,
    endDate: apiComp.endDate,
    status: apiComp.status,
    registrations: apiComp._count?.registrations || 0,
    maxRegistrations: apiComp.maxParticipants || 500, // domyślna wartość
    category,
    featured:
      apiComp.status === "REGISTRATION_OPEN" || apiComp.status === "ONGOING", // zawody otwarte lub w trakcie są wyróżnione
    liveResults: apiComp.liveResultsEnabled || false,
  };
};

async function testMapping() {
  try {
    console.log("🔍 Testing data mapping...");

    const response = await axios.get(
      "http://localhost:3001/competitions/public"
    );
    console.log(`✅ Pobrano ${response.data.length} zawodów z API`);

    console.log("\n📋 Mapowanie danych:");
    const mappedCompetitions = response.data.map((apiComp, index) => {
      console.log(`\n${index + 1}. Mapowanie: ${apiComp.name}`);
      console.log("   API data:");
      console.log("   - id:", apiComp.id);
      console.log("   - name:", apiComp.name);
      console.log("   - location:", apiComp.location);
      console.log("   - status:", apiComp.status);
      console.log("   - maxParticipants:", apiComp.maxParticipants);
      console.log("   - liveResultsEnabled:", apiComp.liveResultsEnabled);
      console.log("   - _count:", apiComp._count);

      const mapped = mapApiCompetitionToLocal(apiComp);

      console.log("   Mapped data:");
      console.log("   - id:", mapped.id);
      console.log("   - name:", mapped.name);
      console.log("   - location:", mapped.location);
      console.log("   - status:", mapped.status);
      console.log("   - registrations:", mapped.registrations);
      console.log("   - maxRegistrations:", mapped.maxRegistrations);
      console.log("   - category:", mapped.category);
      console.log("   - featured:", mapped.featured);
      console.log("   - liveResults:", mapped.liveResults);

      return mapped;
    });

    console.log(`\n✅ Zmapowano ${mappedCompetitions.length} zawodów`);

    // Test filtrowania
    console.log("\n🔍 Test filtrowania:");
    const featuredCompetitions = mappedCompetitions.filter(
      (comp) => comp.featured
    );
    console.log(`- Wyróżnione zawody: ${featuredCompetitions.length}`);

    const openRegistrations = mappedCompetitions.filter(
      (comp) => comp.status === "REGISTRATION_OPEN"
    );
    console.log(`- Otwarte rejestracje: ${openRegistrations.length}`);

    const ongoing = mappedCompetitions.filter(
      (comp) => comp.status === "ONGOING"
    );
    console.log(`- W trakcie: ${ongoing.length}`);

    console.log("\n✅ Test mapowania zakończony pomyślnie!");
  } catch (error) {
    console.error("❌ Error testing mapping:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testMapping();
