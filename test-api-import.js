const fs = require('fs');
const path = require('path');

async function testApiImport() {
  try {
    const API_BASE = 'http://localhost:3002';
    
    console.log('🔐 Logowanie...');
    
    // 1. Zaloguj się
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@athletics.pl',
        password: 'password123'
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error('Błąd logowania');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Zalogowano pomyślnie');
    
    // 2. Utwórz zawody testowe
    console.log('🏆 Tworzenie zawodów testowych...');
    const competitionResponse = await fetch(`${API_BASE}/competitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Sztafet - Import CSV',
        description: 'Zawody testowe do sprawdzenia importu sztafet',
        startDate: '2025-07-15T10:00:00.000Z',
        endDate: '2025-07-15T18:00:00.000Z',
        location: 'Warszawa',
        venue: 'Stadion Narodowy',
        type: 'OUTDOOR',
        isPublic: true,
        allowLateRegistration: true
      }),
    });
    
    if (!competitionResponse.ok) {
      const error = await competitionResponse.text();
      throw new Error(`Błąd tworzenia zawodów: ${error}`);
    }
    
    const competition = await competitionResponse.json();
    console.log('✅ Utworzono zawody:', competition.name, '(ID:', competition.id + ')');
    
    // 3. Przeczytaj plik CSV
    console.log('📁 Czytanie pliku CSV...');
    const csvPath = path.join(__dirname, 'starter.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    console.log('✅ Wczytano plik CSV (', csvData.length, 'znaków)');
    
    // 4. Importuj listę startową
    console.log('📥 Importowanie listy startowej...');
    const importResponse = await fetch(`${API_BASE}/competitions/${competition.id}/import-startlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        csvData: csvData,
        format: 'PZLA'
      }),
    });
    
    if (!importResponse.ok) {
      const error = await importResponse.text();
      throw new Error(`Błąd importu: ${error}`);
    }
    
    const importResult = await importResponse.json();
    console.log('✅ Import zakończony!');
    console.log('📊 Wyniki importu:');
    console.log('   - Sukces:', importResult.success);
    console.log('   - Wiadomość:', importResult.message);
    console.log('   - Zaimportowano:', importResult.importedCount, 'pozycji');
    console.log('   - Wykryty format:', importResult.detectedFormat);
    
    if (importResult.errors && importResult.errors.length > 0) {
      console.log('❌ Błędy:');
      importResult.errors.forEach(error => console.log('   -', error));
    }
    
    if (importResult.warnings && importResult.warnings.length > 0) {
      console.log('⚠️ Ostrzeżenia:');
      importResult.warnings.forEach(warning => console.log('   -', warning));
    }
    
    // 5. Sprawdź utworzone zespoły sztafetowe
    console.log('\n🏃‍♀️ Sprawdzanie zespołów sztafetowych...');
    const relayTeamsResponse = await fetch(`${API_BASE}/relay-teams/competition/${competition.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (relayTeamsResponse.ok) {
      const relayTeams = await relayTeamsResponse.json();
      console.log('✅ Znaleziono', relayTeams.length, 'zespołów sztafetowych:');
      
      relayTeams.forEach(team => {
        console.log(`\n📍 ${team.name} (${team.club})`);
        if (team.members) {
          const sortedMembers = team.members.sort((a, b) => a.position - b.position);
          sortedMembers.forEach(member => {
            const reserveText = member.isReserve ? ' (rezerwowy)' : '';
            console.log(`   ${member.position}. ${member.athlete.firstName} ${member.athlete.lastName}${reserveText}`);
          });
        }
      });
    } else {
      console.log('❌ Błąd pobierania zespołów sztafetowych');
    }
    
    // 6. Sprawdź konkurencje
    console.log('\n🏁 Sprawdzanie konkurencji...');
    const eventsResponse = await fetch(`${API_BASE}/events?competitionId=${competition.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      const relayEvents = events.filter(event => event.name.includes('4x100'));
      console.log('✅ Znaleziono', relayEvents.length, 'konkurencji sztafetowych:');
      
      for (const event of relayEvents) {
        console.log(`\n🏁 ${event.name} (${event.gender}, ${event.category})`);
        
        // Sprawdź rejestracje zespołów na tę konkurencję
        const registrationsResponse = await fetch(`${API_BASE}/relay-teams/events/${event.id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (registrationsResponse.ok) {
          const registrations = await registrationsResponse.json();
          console.log(`   📝 Zarejestrowanych zespołów: ${registrations.length}`);
          registrations.forEach(reg => {
            console.log(`      - ${reg.team?.name || 'Nieznany zespół'}`);
          });
        }
      }
    }
    
    console.log('\n🎉 Test zakończony pomyślnie!');
    console.log('🔗 ID zawodów:', competition.id);
    
  } catch (error) {
    console.error('❌ Błąd podczas testu:', error.message);
  }
}

testApiImport();