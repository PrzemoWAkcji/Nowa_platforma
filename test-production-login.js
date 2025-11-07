const https = require("https");

const API_URL = "nowaplatforma-production.up.railway.app";

const loginData = {
  email: "admin@athletics.pl",
  password: "AdminPass2024!",
};

console.log("🔐 Testing login...\n");

const postData = JSON.stringify(loginData);

const options = {
  hostname: API_URL,
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
    console.log(`Status Code: ${res.statusCode}`);

    if (res.statusCode === 200 || res.statusCode === 201) {
      const response = JSON.parse(data);
      console.log("\n✅ Login successful!");
      console.log("\n👤 User Info:");
      console.log(
        `   Name: ${response.user.firstName} ${response.user.lastName}`
      );
      console.log(`   Email: ${response.user.email}`);
      console.log(`   Role: ${response.user.role}`);
      console.log(`\n🔑 JWT Token: ${response.token.substring(0, 50)}...`);
    } else {
      console.log("❌ Login failed");
      console.log(`Response: ${data}`);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request failed:", error.message);
});

req.write(postData);
req.end();
