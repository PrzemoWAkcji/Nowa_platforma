// Test logowania bezpośrednio do API
const axios = require('axios');

const API_BASE_URL = 'http://127.0.0.1:3004';

async function testLogin() {
  try {
    console.log('🔐 Testowanie logowania...');
    console.log('🌐 API URL:', API_BASE_URL);
    
    // Test połączenia z serwerem
    try {
      const healthCheck = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Serwer odpowiada:', healthCheck.status);
    } catch (error) {
      console.log('❌ Serwer nie odpowiada:', error.message);
      return;
    }
    
    // Test logowania
    const loginData = {
      email: 'admin@athletics.pl',
      password: 'password123'
    };
    
    console.log('📧 Próba logowania:', loginData.email);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Logowanie udane!');
    console.log('👤 Użytkownik:', response.data.user);
    console.log('📝 Wiadomość:', response.data.message);
    console.log('🍪 Cookies:', response.headers['set-cookie']);
    
  } catch (error) {
    console.error('❌ Błąd logowania:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

testLogin();