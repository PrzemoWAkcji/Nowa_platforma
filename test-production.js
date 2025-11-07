const https = require("https");

const BACKEND_URL = "nowaplatforma-production.up.railway.app";

// ====================================
// 1. TEST HEALTH CHECK
// ====================================
function testHealth() {
  return new Promise((resolve, reject) => {
    console.log("1️⃣  Testing health endpoint...");

    const options = {
      hostname: BACKEND_URL,
      port: 443,
      path: "/health",
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("✅ Health check passed:", data);
          resolve();
        } else {
          console.log("❌ Health check failed:", res.statusCode);
          reject(new Error("Health check failed"));
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Health check error:", error.message);
      reject(error);
    });

    req.end();
  });
}

// ====================================
// 2. CREATE ADMIN USER
// ====================================
function createAdmin() {
  return new Promise((resolve, reject) => {
    console.log("\n2️⃣  Creating admin user...");

    const adminData = {
      email: "admin@athletics.pl",
      password: "AdminPass2024!",
      firstName: "Admin",
      lastName: "System",
      phone: "+48123456789",
      role: "ADMIN",
    };

    const postData = JSON.stringify(adminData);

    const options = {
      hostname: BACKEND_URL,
      port: 443,
      path: "/auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log("✅ Admin user created successfully!");
          console.log("\n📧 Login credentials:");
          console.log(`   Email: ${adminData.email}`);
          console.log(`   Password: ${adminData.password}`);
          resolve(adminData);
        } else if (res.statusCode === 409 || data.includes("already exists")) {
          console.log("ℹ️  Admin user already exists");
          console.log("\n📧 Using existing credentials:");
          console.log(`   Email: ${adminData.email}`);
          console.log(`   Password: ${adminData.password}`);
          resolve(adminData);
        } else {
          console.log("❌ Error creating admin:", data);
          reject(new Error(data));
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request failed:", error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// ====================================
// 3. LOGIN AND GET TOKEN
// ====================================
function login(credentials) {
  return new Promise((resolve, reject) => {
    console.log("\n3️⃣  Testing login...");

    const loginData = {
      email: credentials.email,
      password: credentials.password,
    };

    const postData = JSON.stringify(loginData);

    const options = {
      hostname: BACKEND_URL,
      port: 443,
      path: "/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const response = JSON.parse(data);
          console.log("✅ Login successful!");
          console.log(`   Token: ${response.token.substring(0, 30)}...`);
          console.log(
            `   User: ${response.user.email} (${response.user.role})`
          );
          resolve(response.token);
        } else {
          console.log("❌ Login failed:", data);
          reject(new Error(data));
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Login request failed:", error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// ====================================
// 4. TEST AUTHENTICATED ENDPOINT
// ====================================
function testAuthenticatedEndpoint(token) {
  return new Promise((resolve, reject) => {
    console.log("\n4️⃣  Testing authenticated endpoint (GET /auth/me)...");

    const options = {
      hostname: BACKEND_URL,
      port: 443,
      path: "/auth/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          const profile = JSON.parse(data);
          console.log("✅ Profile endpoint working!");
          console.log(`   User: ${profile.email}`);
          console.log(`   Role: ${profile.role}`);
          resolve();
        } else {
          console.log("❌ Profile endpoint failed:", data);
          reject(new Error(data));
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Profile request failed:", error.message);
      reject(error);
    });

    req.end();
  });
}

// ====================================
// 5. TEST COMPETITIONS ENDPOINT
// ====================================
function testCompetitions(token) {
  return new Promise((resolve, reject) => {
    console.log("\n5️⃣  Testing competitions endpoint (GET /competitions)...");

    const options = {
      hostname: BACKEND_URL,
      port: 443,
      path: "/competitions",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          const competitions = JSON.parse(data);
          console.log("✅ Competitions endpoint working!");
          console.log(`   Found ${competitions.length} competitions`);
          resolve();
        } else {
          console.log("❌ Competitions endpoint failed:", data);
          reject(new Error(data));
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Competitions request failed:", error.message);
      reject(error);
    });

    req.end();
  });
}

// ====================================
// RUN ALL TESTS
// ====================================
async function runAllTests() {
  console.log("🚀 Starting production backend tests...\n");
  console.log("Backend URL:", BACKEND_URL);
  console.log("=".repeat(50));

  try {
    // 1. Health check
    await testHealth();

    // 2. Create admin (or use existing)
    const adminCredentials = await createAdmin();

    // 3. Login and get token
    const token = await login(adminCredentials);

    // 4. Test authenticated endpoint
    await testAuthenticatedEndpoint(token);

    // 5. Test competitions endpoint
    await testCompetitions(token);

    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL TESTS PASSED!");
    console.log("\n🎉 Your backend is fully operational!");
    console.log(
      "\n📱 Frontend URL: https://capable-serenity-production-a046.up.railway.app"
    );
    console.log(
      "🔧 Backend URL: https://nowaplatforma-production.up.railway.app"
    );
    console.log("\n💡 You can now login to the frontend with:");
    console.log(`   Email: ${adminCredentials.email}`);
    console.log(`   Password: ${adminCredentials.password}`);
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ TESTS FAILED:", error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
