/**
 * Przykład użycia funkcjonalności Personal Bests i Season Bests
 * 
 * Ten plik pokazuje jak używać API do zarządzania rekordami zawodników
 */

console.log('📚 Przykłady użycia Personal Bests i Season Bests');
console.log('');
console.log('1. Automatyczna aktualizacja przy dodawaniu wyniku:');
console.log(`
const result = await resultsService.create({
  athleteId: "athlete-1",
  eventId: "event-1",
  registrationId: "registration-1", 
  result: "10.45",
  isValid: true
});
// → Automatycznie sprawdzi i zaktualizuje PB/SB
console.log(result.isPersonalBest); // true/false
console.log(result.isSeasonBest);   // true/false
`);

console.log('2. Pobranie rekordów zawodnika:');
console.log(`
const records = await athletesService.getAthleteRecords("athlete-1", "100M");
console.log(records.personalBest); // { result: "10.45", date: "2024-07-15", competition: "..." }
console.log(records.seasonBest);   // { result: "10.50", date: "2024-06-20", competition: "..." }
`);

console.log('3. Ranking zawodników:');
console.log(`
const ranking = await athletesService.getAthletesSortedByRecords(
  '100M',    // konkurencja
  'PB',      // sortuj według PB
  'MALE',    // płeć
  'SENIOR',  // kategoria
  10         // limit wyników
);
`);

console.log('4. Lista startowa posortowana według rekordów:');
console.log(`
const startList = await registrationsService.getStartListSortedByRecords(
  'competition-1',
  'event-1', 
  'SB'  // sortuj według Season Bests
);
`);

console.log('5. Automatyczne rozstawianie w seriach:');
console.log(`
const heats = await heatService.autoAssignParticipants({
  eventId: "event-1",
  method: "SEED_TIME", // Automatycznie użyje PB/SB jeśli brak seed time
  maxLanes: 8
});
// → System automatycznie wybierze najlepszy dostępny czas:
//   1. Seed Time (czas zgłoszeniowy)
//   2. Season Best (rekord sezonu)  
//   3. Personal Best (rekord życiowy)
`);

console.log('✅ Funkcjonalność PB/SB jest w pełni zintegrowana z systemem!');

async function demonstratePBSB() {
  console.log('🏃‍♂️ Demonstracja Personal Bests i Season Bests');
  console.log('Ta funkcjonalność jest zintegrowana z istniejącym systemem.');
  console.log('Sprawdź testy w: src/athletes/athletes-records.service.spec.ts');
}

export { demonstratePBSB };