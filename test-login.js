async function testLogin() {
  try {
    const API_BASE = 'http://localhost:3004';
    
    console.log('🔐 Testowanie logowania...');
    
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
    
    console.log('Status:', loginResponse.status);
    console.log('Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('Error response:', errorText);
      throw new Error('Błąd logowania');
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Zalogowano pomyślnie');
    console.log('Response body:', loginData);
    console.log('Token:', loginData.access_token ? 'Otrzymano' : 'Brak');
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

testLogin();