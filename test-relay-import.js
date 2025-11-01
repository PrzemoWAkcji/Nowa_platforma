const fs = require('fs');
const path = require('path');

// Test importu sztafet
async function testRelayImport() {
  try {
    // Przeczytaj plik CSV
    const csvPath = path.join(__dirname, 'starter.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('🔍 Testowanie importu sztafet...');
    console.log('📁 Plik CSV:', csvPath);
    console.log('📊 Rozmiar pliku:', csvData.length, 'znaków');
    
    // Sprawdź pierwsze linie
    const lines = csvData.split('\n');
    console.log('📋 Liczba linii:', lines.length);
    console.log('📝 Nagłówek:', lines[0]);
    
    // Znajdź linie ze sztafetami
    const relayLines = lines.filter(line => line.includes('K4x100'));
    console.log('🏃‍♀️ Liczba linii ze sztafetami:', relayLines.length);
    
    // Grupuj według klubów
    const clubs = {};
    relayLines.forEach(line => {
      const parts = line.split(';');
      if (parts.length > 12) {
        const club = parts[12]; // Kolumna "Klub"
        const position = parts[30]; // Kolumna "skład"
        const relay = parts[31]; // Kolumna "Sztafeta"
        const firstName = parts[10]; // Kolumna "Imię"
        const lastName = parts[9]; // Kolumna "Nazwisko"
        
        if (club && position && relay === 'K4x100') {
          if (!clubs[club]) {
            clubs[club] = [];
          }
          clubs[club].push({
            firstName: firstName,
            lastName: lastName,
            position: parseInt(position),
            club: club
          });
        }
      }
    });
    
    console.log('\n🏢 Kluby ze sztafetami:');
    Object.keys(clubs).forEach(club => {
      const athletes = clubs[club].sort((a, b) => a.position - b.position);
      console.log(`\n📍 ${club}:`);
      athletes.forEach(athlete => {
        const isReserve = athlete.position > 4 ? ' (rezerwowy)' : '';
        console.log(`  ${athlete.position}. ${athlete.firstName} ${athlete.lastName}${isReserve}`);
      });
    });
    
    // Symuluj żądanie HTTP
    const importData = {
      competitionId: 'test-competition-id',
      csvData: csvData,
      format: 'PZLA'
    };
    
    console.log('\n✅ Test zakończony pomyślnie!');
    console.log('📊 Statystyki:');
    console.log(`   - Klubów: ${Object.keys(clubs).length}`);
    console.log(`   - Zawodników: ${Object.values(clubs).reduce((sum, athletes) => sum + athletes.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Błąd podczas testu:', error.message);
  }
}

testRelayImport();