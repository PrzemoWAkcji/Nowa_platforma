const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRelayAPI() {
  const API_BASE = 'http://localhost:3002';
  
  try {
    // 1. Zaloguj się
    console.log('🔐 Logowanie...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@athletics.pl',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Błąd logowania');
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Zalogowano pomyślnie');

    // 2. Pobierz rejestracje dla konkurencji sztafetowej
    const eventId = 'cmcusqwjs03h5uqtcxscry0yj'; // 4x100 metrów kobiet
    console.log(`\n📥 Pobieranie rejestracji dla konkurencji: ${eventId}`);
    
    const registrationsResponse = await fetch(`${API_BASE}/relay-teams/events/${eventId}/registrations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!registrationsResponse.ok) {
      throw new Error('Błąd podczas pobierania rejestracji');
    }

    const registrations = await registrationsResponse.json();
    console.log(`✅ Pobrano ${registrations.length} rejestracji`);

    // 3. Sprawdź strukturę danych
    if (registrations.length > 0) {
      const firstRegistration = registrations[0];
      console.log('\n📊 Struktura pierwszej rejestracji:');
      console.log('- ID:', firstRegistration.id);
      console.log('- Team ID:', firstRegistration.teamId);
      console.log('- Event ID:', firstRegistration.eventId);
      console.log('- Seed Time:', firstRegistration.seedTime || 'brak');
      
      if (firstRegistration.team) {
        console.log('\n👥 Dane zespołu:');
        console.log('- Nazwa:', firstRegistration.team.name);
        console.log('- Klub:', firstRegistration.team.club || 'brak');
        console.log('- Members:', firstRegistration.team.members ? `${firstRegistration.team.members.length} członków` : 'BRAK!');
        console.log('- Registrations:', firstRegistration.team.registrations ? `${firstRegistration.team.registrations.length} rejestracji` : 'BRAK!');
        
        if (firstRegistration.team.members && firstRegistration.team.members.length > 0) {
          console.log('\n🏃‍♀️ Członkowie zespołu:');
          firstRegistration.team.members.forEach(member => {
            console.log(`  ${member.position}. ${member.athlete.firstName} ${member.athlete.lastName} ${member.isReserve ? '(rezerwowy)' : ''}`);
          });
        }
        
        if (firstRegistration.team.registrations && firstRegistration.team.registrations.length > 0) {
          console.log('\n📝 Rejestracje zespołu:');
          firstRegistration.team.registrations.forEach(reg => {
            console.log(`  - Event ID: ${reg.eventId} (${reg.event?.name || 'nieznana konkurencja'})`);
          });
        }
      } else {
        console.log('❌ Brak danych zespołu!');
      }
    }

  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

testRelayAPI();