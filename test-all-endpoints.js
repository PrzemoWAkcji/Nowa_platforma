/**
 * Comprehensive API Endpoints Test
 * Tests all major endpoints to verify functionality
 */

const axios = require("axios");

const API_URL = "http://localhost:3001";
let authToken = null;

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, status, message = "") {
  const emoji = status === "PASS" ? "✅" : "❌";
  console.log(`${emoji} ${name}: ${status} ${message}`);
  results.tests.push({ name, status, message });
  if (status === "PASS") results.passed++;
  else results.failed++;
}

async function testEndpoint(
  name,
  method,
  url,
  data = null,
  requiresAuth = false
) {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers:
        requiresAuth && authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {},
    };

    if (data) config.data = data;

    const response = await axios(config);
    logTest(name, "PASS", `Status: ${response.status}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status || "NO_RESPONSE";
    const message = error.response?.data?.message || error.message;
    logTest(name, "FAIL", `Status: ${status}, Message: ${message}`);
    return null;
  }
}

async function runTests() {
  console.log("\n🚀 TESTING ALL ENDPOINTS\n");
  console.log("=".repeat(60));

  // 1. Health Check
  console.log("\n📊 HEALTH CHECKS");
  await testEndpoint("Health Check", "GET", "/health");
  await testEndpoint("API Docs", "GET", "/api-docs");

  // 2. Authentication
  console.log("\n🔐 AUTHENTICATION");
  const loginData = await testEndpoint("Login", "POST", "/auth/login", {
    email: "admin@test.com",
    password: "admin123",
  });

  if (loginData?.token) {
    authToken = loginData.token;
    logTest("Token received", "PASS");
  } else {
    logTest("Token received", "FAIL", "No token in response");
  }

  await testEndpoint("Get Profile", "GET", "/auth/profile", null, true);

  // 3. Competitions
  console.log("\n🏆 COMPETITIONS");
  const competitions = await testEndpoint(
    "List Competitions",
    "GET",
    "/competitions",
    null,
    true
  );
  const competitionId = competitions?.[0]?.id;

  if (competitionId) {
    await testEndpoint(
      "Get Competition Details",
      "GET",
      `/competitions/${competitionId}`,
      null,
      true
    );
  }

  // 4. Athletes
  console.log("\n🏃 ATHLETES");
  await testEndpoint("List Athletes", "GET", "/athletes", null, true);
  await testEndpoint(
    "Search Athletes",
    "GET",
    "/athletes/search?query=test",
    null,
    true
  );

  // 5. Events
  console.log("\n🎯 EVENTS");
  if (competitionId) {
    await testEndpoint(
      "List Events",
      "GET",
      `/events?competitionId=${competitionId}`,
      null,
      true
    );
  }

  // 6. Registrations
  console.log("\n📝 REGISTRATIONS");
  if (competitionId) {
    await testEndpoint(
      "List Registrations",
      "GET",
      `/registrations?competitionId=${competitionId}`,
      null,
      true
    );
  }

  // 7. Results
  console.log("\n🥇 RESULTS");
  if (competitionId) {
    await testEndpoint(
      "List Results",
      "GET",
      `/results?competitionId=${competitionId}`,
      null,
      true
    );
  }

  // 8. Combined Events
  console.log("\n🔢 COMBINED EVENTS");
  await testEndpoint(
    "List Combined Event Types",
    "GET",
    "/combined-events/types",
    null,
    false
  );
  await testEndpoint(
    "Get Decathlon Disciplines",
    "GET",
    "/combined-events/types/DECATHLON/disciplines",
    null,
    false
  );

  // 9. Equipment
  console.log("\n⚙️ EQUIPMENT");
  await testEndpoint(
    "List Equipment Categories",
    "GET",
    "/equipment/categories",
    null,
    false
  );

  // 10. Records
  console.log("\n🏅 RECORDS");
  await testEndpoint("List Records", "GET", "/records", null, false);

  // 11. Relay Teams
  console.log("\n👥 RELAY TEAMS");
  if (competitionId) {
    await testEndpoint(
      "List Relay Teams",
      "GET",
      `/relay-teams/competition/${competitionId}`,
      null,
      false
    );
  }

  // 12. Live Results
  console.log("\n📡 LIVE RESULTS");
  if (competitionId) {
    await testEndpoint(
      "Get Live Results",
      "GET",
      `/live-results/${competitionId}`,
      null,
      true
    );
  }

  // 13. Users (Admin)
  console.log("\n👤 USERS");
  await testEndpoint("List Users", "GET", "/users", null, true);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 TEST SUMMARY\n");
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  console.log(
    `🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`
  );

  if (results.failed === 0) {
    console.log("\n🎉 ALL TESTS PASSED! 🎉");
  } else {
    console.log("\n⚠️ Some tests failed. Please review the output above.");
  }

  console.log("\n" + "=".repeat(60));
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test suite failed:", error.message);
  process.exit(1);
});
