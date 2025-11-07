const https = require("https");

const API_URL = "nowaplatforma-production.up.railway.app";

// Dane admina
const adminData = {
  email: "admin@athletics.pl",
  password: "AdminPass2024!",
  firstName: "Admin",
  lastName: "System",
  phone: "+48123456789",
  role: "ADMIN",
};

console.log("🚀 Creating admin user in production database...\n");

const postData = JSON.stringify(adminData);

const options = {
  hostname: API_URL,
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
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data}\n`);

    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log("✅ Admin user created successfully!");
      console.log("\n📧 Login credentials:");
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
    } else if (res.statusCode === 409 || data.includes("already exists")) {
      console.log("ℹ️  Admin user already exists in database");
      console.log("\n📧 Use existing credentials:");
      console.log(`   Email: ${adminData.email}`);
    } else {
      console.log("❌ Error creating admin user");
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request failed:", error.message);
});

req.write(postData);
req.end();
