"use strict";
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const testUsers = [
    {
        email: 'admin@athletics.pl',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'Testowy',
        phone: '+48123456789',
        role: 'ADMIN',
    },
    {
        email: 'organizer@athletics.pl',
        password: 'password123',
        firstName: 'Organizator',
        lastName: 'Testowy',
        phone: '+48123456788',
        role: 'ORGANIZER',
    },
    {
        email: 'coach@athletics.pl',
        password: 'password123',
        firstName: 'Trener',
        lastName: 'Testowy',
        phone: '+48123456787',
        role: 'COACH',
    },
    {
        email: 'athlete@athletics.pl',
        password: 'password123',
        firstName: 'Zawodnik',
        lastName: 'Testowy',
        phone: '+48123456786',
        role: 'ATHLETE',
    },
];
async function createAllTestUsers() {
    try {
        console.log('🔐 Tworzenie użytkowników testowych...');
        for (const userData of testUsers) {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });
            if (existingUser) {
                console.log(`✅ Użytkownik ${userData.email} już istnieje`);
                console.log(`   📧 Email: ${existingUser.email}`);
                console.log(`   👤 Imię: ${existingUser.firstName} ${existingUser.lastName}`);
                console.log(`   🔑 Rola: ${existingUser.role}`);
                console.log(`   ✅ Aktywny: ${existingUser.isActive}`);
                console.log('');
                continue;
            }
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            await prisma.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    role: userData.role,
                    isActive: true,
                },
            });
            console.log(`✅ Użytkownik ${userData.email} utworzony pomyślnie!`);
            console.log(`   📧 Email: ${userData.email}`);
            console.log(`   🔑 Hasło: ${userData.password}`);
            console.log(`   👤 Rola: ${userData.role}`);
            console.log('');
        }
        console.log('🎉 Wszystkie użytkownicy testowi zostali utworzeni!');
    }
    catch (error) {
        console.error('❌ Błąd:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createAllTestUsers();
//# sourceMappingURL=create-all-test-users.js.map