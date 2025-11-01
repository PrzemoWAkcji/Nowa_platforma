// Quick script to check password
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    console.log('🔐 Sprawdzanie hasła...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@athletics.pl' }
    });
    
    if (!user) {
      console.log('❌ Użytkownik nie istnieje');
      return;
    }
    
    console.log('👤 Użytkownik znaleziony:', user.email);
    console.log('✅ Aktywny:', user.isActive);
    
    // Sprawdź hasło
    const isValid = await bcrypt.compare('password123', user.password);
    console.log('🔑 Hasło "password123" jest poprawne:', isValid);
    
    // Sprawdź inne możliwe hasła
    const passwords = ['admin', 'admin123', 'test', 'test123'];
    for (const pwd of passwords) {
      const valid = await bcrypt.compare(pwd, user.password);
      if (valid) {
        console.log(`🔑 Hasło "${pwd}" jest poprawne!`);
      }
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();