"use strict";
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function checkUsers() {
    try {
        console.log('🔍 Sprawdzanie użytkowników...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                password: true,
            },
        });
        console.log(`📊 Znaleziono ${users.length} użytkowników:`);
        for (const user of users) {
            console.log(`\n👤 ${user.email}`);
            console.log(`   Imię: ${user.firstName} ${user.lastName}`);
            console.log(`   Rola: ${user.role}`);
            console.log(`   Aktywny: ${user.isActive}`);
            console.log(`   Hasło hash: ${user.password.substring(0, 20)}...`);
            const isPasswordValid = await bcrypt.compare('password123', user.password);
            console.log(`   Hasło 'password123' pasuje: ${isPasswordValid ? '✅' : '❌'}`);
            const isAdminPasswordValid = await bcrypt.compare('admin123', user.password);
            console.log(`   Hasło 'admin123' pasuje: ${isAdminPasswordValid ? '✅' : '❌'}`);
        }
    }
    catch (error) {
        console.error('❌ Błąd:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkUsers();
//# sourceMappingURL=check-users.js.map