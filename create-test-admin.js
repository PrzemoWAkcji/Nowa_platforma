const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://postgres.uuanevlshccytwklhlrb:Pomidorowa1976!@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require",
    },
  },
});

async function main() {
  console.log("Creating test admin for JWT verification...\n");

  // Check if admin@test.com already exists
  const existing = await prisma.user.findUnique({
    where: { email: "admin@test.com" },
  });

  if (existing) {
    console.log("User admin@test.com already exists, deleting...");
    await prisma.user.delete({
      where: { email: "admin@test.com" },
    });
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const newUser = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Test",
      role: "ADMIN",
    },
  });

  console.log("SUCCESS: Test admin user created!");
  console.log("");
  console.log("Credentials:");
  console.log("   Email: admin@test.com");
  console.log("   Password: admin123");
  console.log("   Role: ADMIN");
  console.log("");
  console.log("Test with:");
  console.log("   .\\test-new-jwt.ps1");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
