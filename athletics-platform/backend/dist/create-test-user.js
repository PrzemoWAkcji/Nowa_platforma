"use strict";
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function createTestUser() {
    try {
        console.log('🔐 Tworzenie użytkownika testowego...');
        const existingUser = await prisma.user.findUnique({
            where: { email: 'admin@athletics.pl' }
        });
        if (existingUser) {
            console.log('✅ Użytkownik admin@athletics.pl już istnieje');
            console.log('📧 Email:', existingUser.email);
            console.log('👤 Imię:', existingUser.firstName);
            console.log('🔑 Rola:', existingUser.role);
            console.log('✅ Aktywny:', existingUser.isActive);
            return;
        }
        const hashedPassword = await bcrypt.hash('password123', 12);
        const user = await prisma.user.create({
            data: {
                email: 'admin@athletics.pl',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'Testowy',
                phone: '+48123456789',
                role: 'ADMIN',
                isActive: true
            }
        });
        console.log('✅ Użytkownik utworzony pomyślnie!');
        console.log('📧 Email: admin@athletics.pl');
        console.log('🔑 Hasło: password123');
        console.log('👤 Rola: ADMIN');
    }
    catch (error) {
        console.error('❌ Błąd:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createTestUser();
//# sourceMappingURL=create-test-user.js.map