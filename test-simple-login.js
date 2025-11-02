const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testLogin() {
  try {
    console.log("🔐 Testing login...");

    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@athletics.pl",
      password: "password123",
    });

    console.log("✅ Login successful!");
    console.log("Full response:", JSON.stringify(response.data, null, 2));
    console.log("Token:", response.data.token);
    console.log("User:", response.data.user);

    // Test protected endpoint
    console.log("\n🔒 Testing protected endpoint...");
    const protectedResponse = await axios.get(`${API_BASE}/competitions`, {
      headers: {
        Authorization: `Bearer ${response.data.token}`,
      },
    });

    console.log("✅ Protected endpoint works!");
    console.log("Competitions:", protectedResponse.data.length);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testLogin();
