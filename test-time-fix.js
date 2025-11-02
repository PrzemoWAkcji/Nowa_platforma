// Test naprawy problemu z czasem 32:45

console.log("=== TEST NAPRAWY FORMATOWANIA CZASU ===\n");

// Funkcja naprawiona (z kodu)
function formatTimeKey(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Time";
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Funkcja problematyczna (oryginalna)
function formatTimeKeyOld(date) {
  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Test z różnymi czasami
const testDates = [
  new Date("2024-01-01T08:00:00"),
  new Date("2024-01-01T23:59:00"),
  new Date("2024-01-02T00:00:00"), // Następny dzień
  new Date("2024-01-02T08:00:00"), // 24h później
];

// Dodaj czasy które mogą powodować problem
const startTime = new Date("2024-01-01T08:00:00");

// Symuluj długi harmonogram
let currentTime = new Date(startTime);
const longScheduleTimes = [];

// Dodaj 20 wydarzeń po 2 godziny każde
for (let i = 0; i < 20; i++) {
  longScheduleTimes.push(new Date(currentTime));
  currentTime = new Date(currentTime.getTime() + 2 * 60 * 60000); // +2h
}

console.log("Test podstawowych czasów:");
testDates.forEach((date, i) => {
  console.log(`Data ${i + 1}:`);
  console.log(`  Oryginalna: ${formatTimeKeyOld(date)}`);
  console.log(`  Naprawiona: ${formatTimeKey(date)}`);
  console.log(`  ISO: ${date.toISOString()}`);
  console.log("");
});

console.log("Test długiego harmonogramu (40 godzin):");
longScheduleTimes.forEach((date, i) => {
  const original = formatTimeKeyOld(date);
  const fixed = formatTimeKey(date);

  if (original !== fixed) {
    console.log(`⚠️  Różnica w czasie ${i + 1}:`);
    console.log(`    Oryginalna: ${original}`);
    console.log(`    Naprawiona: ${fixed}`);
    console.log(`    ISO: ${date.toISOString()}`);
  } else {
    console.log(`✅ Czas ${i + 1}: ${fixed} (OK)`);
  }
});

// Test z błędnymi danymi
console.log("\nTest z błędnymi danymi:");
const badInputs = [null, undefined, new Date("invalid"), "not a date", 123456];

badInputs.forEach((input, i) => {
  try {
    const result = formatTimeKey(input);
    console.log(`Błędne dane ${i + 1}: ${result}`);
  } catch (error) {
    console.log(`Błędne dane ${i + 1}: ERROR - ${error.message}`);
  }
});

console.log("\n=== PODSUMOWANIE ===");
console.log(
  '✅ Naprawiona funkcja formatTimeKey() powinna rozwiązać problem z czasami typu "32:45"'
);
console.log("✅ Funkcja bezpiecznie obsługuje błędne dane");
console.log("✅ Czasy są zawsze w formacie HH:MM (0-23 godziny)");
