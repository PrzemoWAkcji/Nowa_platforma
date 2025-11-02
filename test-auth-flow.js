// Test pełnego flow logowania
async function testAuthFlow() {
  console.log("🚀 Rozpoczynam test pełnego auth flow...");

  try {
    // 1. Test logowania API
    console.log("1️⃣ Testuję API logowania...");
    const loginResponse = await fetch("http://localhost:3001/auth/login", {
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

    if (!loginResponse.ok) {
      throw new Error(`Login API failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log("✅ API logowania działa:", {
      user: loginData.user.email,
      role: loginData.user.role,
      hasToken: !!loginData.token,
    });

    // 2. Test dostępu do strony głównej
    console.log("2️⃣ Testuję dostęp do strony głównej...");
    const homeResponse = await fetch("http://localhost:3000", {
      credentials: "include",
    });

    console.log("✅ Strona główna:", homeResponse.status);

    // 3. Test dostępu do dashboard
    console.log("3️⃣ Testuję dostęp do dashboard...");
    const dashboardResponse = await fetch("http://localhost:3000/dashboard", {
      credentials: "include",
    });

    console.log("✅ Dashboard:", dashboardResponse.status);

    // 4. Test profile API (sprawdź czy sesja działa)
    console.log("4️⃣ Testuję API profilu...");
    const profileResponse = await fetch("http://localhost:3001/auth/profile", {
      credentials: "include",
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log("✅ API profilu działa:", {
        user: profileData.email,
        role: profileData.role,
      });
    } else {
      console.log("❌ API profilu nie działa:", profileResponse.status);
    }

    // 5. Sprawdź czy cookies są ustawione
    console.log("5️⃣ Sprawdzam cookies...");
    // W Node.js nie mamy dostępu do document.cookie, ale możemy sprawdzić headers
    console.log(
      "Headers z ostatniego requesta:",
      Object.fromEntries(dashboardResponse.headers)
    );

    return {
      success: true,
      loginWorking: loginResponse.ok,
      homeWorking: homeResponse.ok,
      dashboardWorking: dashboardResponse.ok,
      profileWorking: profileResponse.ok,
    };
  } catch (error) {
    console.error("❌ Błąd w teście:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Uruchom test
testAuthFlow().then((result) => {
  console.log("🏁 Wynik testu auth flow:", result);

  if (result.success) {
    console.log("\n📋 Podsumowanie:");
    console.log("- API logowania:", result.loginWorking ? "✅" : "❌");
    console.log("- Strona główna:", result.homeWorking ? "✅" : "❌");
    console.log("- Dashboard:", result.dashboardWorking ? "✅" : "❌");
    console.log("- API profilu:", result.profileWorking ? "✅" : "❌");

    if (
      result.loginWorking &&
      result.dashboardWorking &&
      result.profileWorking
    ) {
      console.log(
        "\n✅ Wszystkie komponenty działają - problem może być w React state management"
      );
    } else {
      console.log(
        "\n❌ Niektóre komponenty nie działają - sprawdź backend/frontend"
      );
    }
  }
});
