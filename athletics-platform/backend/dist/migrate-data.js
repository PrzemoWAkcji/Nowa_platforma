"use strict";
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const sqliteClient = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db',
        },
    },
});
const postgresClient = new PrismaClient();
async function checkSQLiteData() {
    console.log('📊 Sprawdzanie danych w SQLite...\n');
    try {
        const users = await sqliteClient.user.count();
        const athletes = await sqliteClient.athlete.count();
        const competitions = await sqliteClient.competition.count();
        const events = await sqliteClient.event.count();
        const registrations = await sqliteClient.registration.count();
        const results = await sqliteClient.result.count();
        const combinedEvents = await sqliteClient.combinedEvent.count();
        const records = await sqliteClient.record.count();
        console.log(`👥 Użytkownicy: ${users}`);
        console.log(`🏃 Zawodnicy: ${athletes}`);
        console.log(`🏆 Zawody: ${competitions}`);
        console.log(`📅 Wydarzenia: ${events}`);
        console.log(`📝 Rejestracje: ${registrations}`);
        console.log(`⏱️  Wyniki: ${results}`);
        console.log(`🔢 Wieloboje: ${combinedEvents}`);
        console.log(`📊 Rekordy: ${records}`);
        const total = users +
            athletes +
            competitions +
            events +
            registrations +
            results +
            combinedEvents +
            records;
        console.log(`\n📦 Łącznie rekordów: ${total}\n`);
        return {
            users,
            athletes,
            competitions,
            events,
            registrations,
            results,
            combinedEvents,
            records,
            total,
        };
    }
    catch (error) {
        console.error('❌ Błąd podczas sprawdzania SQLite:', error.message);
        return null;
    }
}
async function migrateData() {
    console.log('🚀 Start migracji danych ze SQLite do PostgreSQL\n');
    console.log('='.repeat(60) + '\n');
    try {
        const sqliteStats = await checkSQLiteData();
        if (!sqliteStats || sqliteStats.total === 0) {
            console.log('⚠️  Brak danych do migracji w bazie SQLite');
            return;
        }
        console.log('🔄 Rozpoczynam migrację...\n');
        console.log('👥 Migracja użytkowników...');
        const users = await sqliteClient.user.findMany();
        for (const user of users) {
            await postgresClient.user.upsert({
                where: { id: user.id },
                update: user,
                create: user,
            });
        }
        console.log(`✅ Zmigrowano ${users.length} użytkowników\n`);
        console.log('🏃 Migracja zawodników...');
        const athletes = await sqliteClient.athlete.findMany();
        for (const athlete of athletes) {
            await postgresClient.athlete.upsert({
                where: { id: athlete.id },
                update: athlete,
                create: athlete,
            });
        }
        console.log(`✅ Zmigrowano ${athletes.length} zawodników\n`);
        console.log('🏆 Migracja zawodów...');
        const competitions = await sqliteClient.competition.findMany();
        for (const competition of competitions) {
            await postgresClient.competition.upsert({
                where: { id: competition.id },
                update: competition,
                create: competition,
            });
        }
        console.log(`✅ Zmigrowano ${competitions.length} zawodów\n`);
        console.log('🔢 Migracja wielobojów...');
        const combinedEvents = await sqliteClient.combinedEvent.findMany();
        for (const combinedEvent of combinedEvents) {
            await postgresClient.combinedEvent.upsert({
                where: { id: combinedEvent.id },
                update: combinedEvent,
                create: combinedEvent,
            });
        }
        console.log(`✅ Zmigrowano ${combinedEvents.length} wielobojów\n`);
        console.log('📅 Migracja wydarzeń...');
        const events = await sqliteClient.event.findMany();
        for (const event of events) {
            await postgresClient.event.upsert({
                where: { id: event.id },
                update: event,
                create: event,
            });
        }
        console.log(`✅ Zmigrowano ${events.length} wydarzeń\n`);
        console.log('📝 Migracja rejestracji...');
        const registrations = await sqliteClient.registration.findMany();
        for (const registration of registrations) {
            await postgresClient.registration.upsert({
                where: { id: registration.id },
                update: registration,
                create: registration,
            });
        }
        console.log(`✅ Zmigrowano ${registrations.length} rejestracji\n`);
        console.log('⏱️  Migracja wyników...');
        const results = await sqliteClient.result.findMany();
        for (const result of results) {
            await postgresClient.result.upsert({
                where: { id: result.id },
                update: result,
                create: result,
            });
        }
        console.log(`✅ Zmigrowano ${results.length} wyników\n`);
        console.log('📊 Migracja rekordów...');
        const records = await sqliteClient.record.findMany();
        for (const record of records) {
            await postgresClient.record.upsert({
                where: { id: record.id },
                update: record,
                create: record,
            });
        }
        console.log(`✅ Zmigrowano ${records.length} rekordów\n`);
        console.log('🤝 Migracja drużyn sztafetowych...');
        try {
            const relayTeams = await sqliteClient.relayTeam.findMany({
                include: {
                    members: true,
                },
            });
            for (const team of relayTeams) {
                const { members, ...teamData } = team;
                await postgresClient.relayTeam.upsert({
                    where: { id: team.id },
                    update: teamData,
                    create: teamData,
                });
                for (const member of members) {
                    await postgresClient.relayTeamMember.upsert({
                        where: { id: member.id },
                        update: member,
                        create: member,
                    });
                }
            }
            console.log(`✅ Zmigrowano ${relayTeams.length} drużyn sztafetowych\n`);
        }
        catch (error) {
            console.log(`⚠️  Pominięto drużyny sztafetowe: ${error.message}\n`);
        }
        console.log('⚖️  Migracja protestów...');
        try {
            const protests = await sqliteClient.protest.findMany();
            for (const protest of protests) {
                await postgresClient.protest.upsert({
                    where: { id: protest.id },
                    update: protest,
                    create: protest,
                });
            }
            console.log(`✅ Zmigrowano ${protests.length} protestów\n`);
        }
        catch (error) {
            console.log(`⚠️  Pominięto protesty: ${error.message}\n`);
        }
        console.log('='.repeat(60));
        console.log('✅ MIGRACJA ZAKOŃCZONA POMYŚLNIE!\n');
        await checkPostgreSQLData();
    }
    catch (error) {
        console.error('❌ Błąd podczas migracji:', error);
        console.error(error.stack);
    }
    finally {
        await sqliteClient.$disconnect();
        await postgresClient.$disconnect();
    }
}
async function checkPostgreSQLData() {
    console.log('\n📊 Sprawdzanie danych w PostgreSQL (Supabase)...\n');
    try {
        const users = await postgresClient.user.count();
        const athletes = await postgresClient.athlete.count();
        const competitions = await postgresClient.competition.count();
        const events = await postgresClient.event.count();
        const registrations = await postgresClient.registration.count();
        const results = await postgresClient.result.count();
        const combinedEvents = await postgresClient.combinedEvent.count();
        const records = await postgresClient.record.count();
        console.log(`👥 Użytkownicy: ${users}`);
        console.log(`🏃 Zawodnicy: ${athletes}`);
        console.log(`🏆 Zawody: ${competitions}`);
        console.log(`📅 Wydarzenia: ${events}`);
        console.log(`📝 Rejestracje: ${registrations}`);
        console.log(`⏱️  Wyniki: ${results}`);
        console.log(`🔢 Wieloboje: ${combinedEvents}`);
        console.log(`📊 Rekordy: ${records}`);
        const total = users +
            athletes +
            competitions +
            events +
            registrations +
            results +
            combinedEvents +
            records;
        console.log(`\n📦 Łącznie rekordów: ${total}\n`);
    }
    catch (error) {
        console.error('❌ Błąd podczas sprawdzania PostgreSQL:', error.message);
    }
}
migrateData()
    .then(() => {
    console.log('🎉 Gotowe!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Krytyczny błąd:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate-data.js.map