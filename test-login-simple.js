// Prosty test logowania
async function testLogin() {
  console.log("🚀 Rozpoczynam test logowania...");

  try {
    // Symuluj wywołanie API
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: "organizer@athletics.pl",
        password: "password123",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Odpowiedź z API:", data);

    // Sprawdź czy otrzymaliśmy token i dane użytkownika
    if (data.token && data.user) {
      console.log("✅ Logowanie udane!");
      console.log("📧 Email:", data.user.email);
      console.log("👤 Rola:", data.user.role);
      console.log("🔑 Token:", data.token ? "PRESENT" : "MISSING");

      // Sprawdź czy możemy uzyskać dostęp do dashboard
      const dashboardResponse = await fetch("http://localhost:3000/dashboard", {
        credentials: "include",
      });

      console.log("🏠 Dashboard status:", dashboardResponse.status);

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } else {
      throw new Error("Brak tokenu lub danych użytkownika w odpowiedzi");
    }
  } catch (error) {
    console.error("❌ Błąd testu logowania:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Uruchom test
testLogin().then((result) => {
  console.log("🏁 Wynik testu:", result);
});
