const axios = require('axios');

async function testDashboardAPI() {
  try {
    console.log('🔍 Testowanie API dashboard...');
    
    // 1. Zaloguj się jako organizator
    console.log('\n1. Logowanie jako organizator...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'organizer@athletics.pl',
      password: 'password123'
    });
    
    console.log('✅ Logowanie udane');
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`   Użytkownik: ${user.email} (${user.role})`);
    
    // 2. Pobierz zawody organizatora
    console.log('\n2. Pobieranie zawodów organizatora...');
    const competitionsResponse = await axios.get('http://localhost:3001/competitions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Znaleziono ${competitionsResponse.data.length} zawodów:`);
    competitionsResponse.data.forEach((comp, index) => {
      console.log(`   ${index + 1}. ${comp.name} (${comp.status})`);
      console.log(`      Data: ${new Date(comp.startDate).toLocaleDateString('pl-PL')}`);
      console.log(`      Lokalizacja: ${comp.location}`);
      console.log(`      Utworzony przez: ${comp.createdById}`);
    });
    
    // 3. Sprawdź statystyki
    console.log('\n3. Sprawdzanie statystyk...');
    
    // Policz aktywne zawody
    const activeCompetitions = competitionsResponse.data.filter(comp => 
      comp.status === 'REGISTRATION_OPEN' || comp.status === 'PUBLISHED'
    );
    console.log(`   Aktywne zawody: ${activeCompetitions.length}`);
    
    // Pobierz rejestracje dla każdego zawodu
    let totalRegistrations = 0;
    for (const comp of competitionsResponse.data) {
      try {
        const registrationsResponse = await axios.get(
          `http://localhost:3001/competitions/${comp.id}/registrations`, 
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        console.log(`   ${comp.name}: ${registrationsResponse.data.length} rejestracji`);
        totalRegistrations += registrationsResponse.data.length;
      } catch (error) {
        console.log(`   ${comp.name}: Błąd pobierania rejestracji (${error.response?.status})`);
      }
    }
    
    console.log(`   Łączna liczba rejestracji: ${totalRegistrations}`);
    
    // 4. Test publicznych zawodów (dla porównania)
    console.log('\n4. Porównanie z publicznymi zawodami...');
    const publicResponse = await axios.get('http://localhost:3001/competitions/public');
    console.log(`   Publiczne zawody: ${publicResponse.data.length}`);
    
    console.log('\n✅ Test dashboard API zakończony pomyślnie!');
    
  } catch (error) {
    console.error('❌ Błąd:', error.response?.data || error.message);
  }
}

testDashboardAPI();