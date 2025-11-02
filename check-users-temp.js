const { PrismaClient } = require("@prisma/client");

async function checkUsers() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    console.log("Users in database:");
    users.forEach((u) => console.log(`- ${u.email} (${u.role})`));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
