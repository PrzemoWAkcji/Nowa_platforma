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
  console.log("Checking users in database...\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    console.log("No users found in database!");
    console.log("\nCreating test admin user...\n");

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
    console.log("   Email: admin@test.com");
    console.log("   Password: admin123");
    console.log("   Name: Admin Test");
    console.log("   Role: ADMIN");
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user) => {
      console.log(`   ${user.email} (${user.role})`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log("");
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
