async function testAuth() {
  try {
    const API_BASE = "http://localhost:3001";

    console.log("🔐 Testing login...");

    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@athletics.pl",
        password: "password123",
      }),
    });

    console.log("Login response status:", loginResponse.status);

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log("Login error:", error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log("Login data:", loginData);
    const token = loginData.token;

    // Test competitions endpoint
    console.log("\n🏆 Testing competitions endpoint...");
    const competitionsResponse = await fetch(`${API_BASE}/competitions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Competitions response status:", competitionsResponse.status);

    if (!competitionsResponse.ok) {
      const error = await competitionsResponse.text();
      console.log("Competitions error:", error);
      return;
    }

    const competitions = await competitionsResponse.json();
    console.log("Competitions:", competitions);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAuth();
