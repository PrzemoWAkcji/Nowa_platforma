"use strict";
const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');
const sqlitePath = path.join(__dirname, 'prisma', 'dev.db');
const postgresClient = new PrismaClient();
async function checkSQLiteData(db) {
    console.log('📊 Sprawdzanie danych w SQLite...\n');
    try {
        const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const athletes = db
            .prepare('SELECT COUNT(*) as count FROM athletes')
            .get().count;
        const competitions = db
            .prepare('SELECT COUNT(*) as count FROM competitions')
            .get().count;
        const events = db
            .prepare('SELECT COUNT(*) as count FROM events')
            .get().count;
        const registrations = db
            .prepare('SELECT COUNT(*) as count FROM registrations')
            .get().count;
        const results = db
            .prepare('SELECT COUNT(*) as count FROM results')
            .get().count;
        let combinedEvents = 0;
        let records = 0;
        try {
            combinedEvents = db
                .prepare('SELECT COUNT(*) as count FROM combined_events')
                .get().count;
        }
        catch (e) {
            console.log('ℹ️  Tabela combined_events nie istnieje');
        }
        try {
            records = db.prepare('SELECT COUNT(*) as count FROM records').get().count;
        }
        catch (e) {
            console.log('ℹ️  Tabela records nie istnieje');
        }
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
function convertValue(value) {
    if (value === null || value === undefined)
        return null;
    if (typeof value === 'string') {
        if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
            return new Date(value);
        }
    }
    if (typeof value === 'number') {
        return value;
    }
    return value;
}
async function migrateData() {
    console.log('🚀 Start migracji danych ze SQLite do PostgreSQL\n');
    console.log('='.repeat(60) + '\n');
    let db;
    try {
        console.log(`📂 Otwieranie bazy SQLite: ${sqlitePath}\n`);
        db = new Database(sqlitePath, { readonly: true });
        const sqliteStats = await checkSQLiteData(db);
        if (!sqliteStats || sqliteStats.total === 0) {
            console.log('⚠️  Brak danych do migracji w bazie SQLite');
            db.close();
            return;
        }
        console.log('🔄 Rozpoczynam migrację...\n');
        console.log('👥 Migracja użytkowników...');
        const users = db.prepare('SELECT * FROM users').all();
        for (const user of users) {
            const userData = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                password: user.password,
                isActive: Boolean(user.isActive),
                createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
                lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
            };
            await postgresClient.user.upsert({
                where: { id: userData.id },
                update: userData,
                create: userData,
            });
        }
        console.log(`✅ Zmigrowano ${users.length} użytkowników\n`);
        console.log('🏃 Migracja zawodników...');
        const athletes = db.prepare('SELECT * FROM athletes').all();
        for (const athlete of athletes) {
            let category = 'SENIOR';
            if (athlete.dateOfBirth) {
                const birthDate = new Date(athlete.dateOfBirth);
                const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
                if (age < 20)
                    category = 'U20';
                else if (age >= 35 && age < 40)
                    category = 'M35';
                else if (age >= 40 && age < 45)
                    category = 'M40';
                else if (age >= 45 && age < 50)
                    category = 'M45';
                else if (age >= 50 && age < 55)
                    category = 'M50';
                else if (age >= 55 && age < 60)
                    category = 'M55';
                else if (age >= 60 && age < 65)
                    category = 'M60';
                else if (age >= 65)
                    category = 'M65';
            }
            const athleteData = {
                id: athlete.id,
                firstName: athlete.firstName,
                lastName: athlete.lastName,
                dateOfBirth: new Date(athlete.dateOfBirth),
                gender: athlete.gender,
                club: athlete.club,
                category: category,
                nationality: athlete.nationality || 'POL',
                licenseNumber: athlete.pzlaLicenseNumber || null,
                classification: null,
                isParaAthlete: false,
                coachId: athlete.coachId,
                personalBests: athlete.personalBests || null,
                seasonBests: athlete.seasonBests || null,
                createdAt: athlete.createdAt ? new Date(athlete.createdAt) : new Date(),
                updatedAt: athlete.updatedAt ? new Date(athlete.updatedAt) : new Date(),
            };
            await postgresClient.athlete.upsert({
                where: { id: athleteData.id },
                update: athleteData,
                create: athleteData,
            });
        }
        console.log(`✅ Zmigrowano ${athletes.length} zawodników\n`);
        console.log('🏆 Migracja zawodów...');
        const competitions = db.prepare('SELECT * FROM competitions').all();
        const defaultCreator = await postgresClient.user.findFirst();
        for (const competition of competitions) {
            const competitionData = {
                id: competition.id,
                name: competition.name,
                description: competition.description,
                location: competition.venue || 'Brak informacji o lokalizacji',
                venue: competition.venue,
                startDate: new Date(competition.startDate),
                endDate: new Date(competition.endDate),
                type: competition.eventType || 'OUTDOOR',
                status: competition.status || 'DRAFT',
                registrationStartDate: competition.registrationDeadline
                    ? new Date(competition.registrationDeadline)
                    : null,
                registrationEndDate: competition.registrationDeadline
                    ? new Date(competition.registrationDeadline)
                    : null,
                maxParticipants: competition.maxParticipants,
                isPublic: true,
                allowLateRegistration: false,
                createdById: competition.organizerId || defaultCreator.id,
                createdAt: competition.createdAt
                    ? new Date(competition.createdAt)
                    : new Date(),
                updatedAt: competition.updatedAt
                    ? new Date(competition.updatedAt)
                    : new Date(),
            };
            await postgresClient.competition.upsert({
                where: { id: competitionData.id },
                update: competitionData,
                create: competitionData,
            });
        }
        console.log(`✅ Zmigrowano ${competitions.length} zawodów\n`);
        console.log('🔢 Migracja wielobojów...');
        try {
            const combinedEvents = db.prepare('SELECT * FROM combined_events').all();
            for (const combinedEvent of combinedEvents) {
                const combinedEventData = {
                    id: combinedEvent.id,
                    competitionId: combinedEvent.competitionId,
                    name: combinedEvent.name,
                    type: combinedEvent.type,
                    gender: combinedEvent.gender,
                    ageCategory: combinedEvent.ageCategory,
                    eventIds: combinedEvent.eventIds || null,
                    status: combinedEvent.status || 'PLANNED',
                    createdAt: combinedEvent.createdAt
                        ? new Date(combinedEvent.createdAt)
                        : new Date(),
                    updatedAt: combinedEvent.updatedAt
                        ? new Date(combinedEvent.updatedAt)
                        : new Date(),
                };
                await postgresClient.combinedEvent.upsert({
                    where: { id: combinedEventData.id },
                    update: combinedEventData,
                    create: combinedEventData,
                });
            }
            console.log(`✅ Zmigrowano ${combinedEvents.length} wielobojów\n`);
        }
        catch (error) {
            console.log(`⚠️  Pominięto wieloboje: ${error.message}\n`);
        }
        console.log('📅 Migracja wydarzeń...');
        const events = db.prepare('SELECT * FROM events').all();
        for (const event of events) {
            let category = event.ageCategory || 'SENIOR';
            let unit = 'TIME';
            if (event.type === 'FIELD') {
                if (event.name &&
                    (event.name.includes('skok') ||
                        event.name.includes('wzwyż') ||
                        event.name.toLowerCase().includes('jump') ||
                        event.name.toLowerCase().includes('high'))) {
                    unit = 'HEIGHT';
                }
                else {
                    unit = 'DISTANCE';
                }
            }
            else if (event.type === 'COMBINED') {
                unit = 'POINTS';
            }
            const eventData = {
                id: event.id,
                competitionId: event.competitionId,
                name: event.name,
                type: event.type,
                gender: event.gender,
                category: category,
                unit: unit,
                maxParticipants: event.maxParticipants,
                seedTimeRequired: false,
                scheduledTime: event.scheduledTime
                    ? new Date(event.scheduledTime)
                    : null,
                isCompleted: event.status === 'COMPLETED',
                distance: null,
                discipline: null,
                hurdleHeight: null,
                implementWeight: null,
                implementSpecs: null,
                isComponentEvent: Boolean(event.combinedEventId),
                parentEventId: event.combinedEventId,
                createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
                updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
            };
            await postgresClient.event.upsert({
                where: { id: eventData.id },
                update: eventData,
                create: eventData,
            });
        }
        console.log(`✅ Zmigrowano ${events.length} wydarzeń\n`);
        console.log('📝 Migracja rejestracji...');
        const registrations = db.prepare('SELECT * FROM registrations').all();
        for (const registration of registrations) {
            const registrationData = {
                id: registration.id,
                athleteId: registration.athleteId,
                eventId: registration.eventId,
                competitionId: registration.competitionId,
                userId: registration.userId,
                status: registration.status || 'PENDING',
                seedingResult: registration.seedingResult,
                startNumber: registration.startNumber,
                lane: registration.lane,
                heat: registration.heat,
                startingHeight: registration.startingHeight,
                createdAt: registration.createdAt
                    ? new Date(registration.createdAt)
                    : new Date(),
                updatedAt: registration.updatedAt
                    ? new Date(registration.updatedAt)
                    : new Date(),
            };
            await postgresClient.registration.upsert({
                where: { id: registrationData.id },
                update: registrationData,
                create: registrationData,
            });
        }
        console.log(`✅ Zmigrowano ${registrations.length} rejestracji\n`);
        console.log('⏱️  Migracja wyników...');
        const results = db.prepare('SELECT * FROM results').all();
        for (const result of results) {
            const status = result.status || 'VALID';
            const isValid = status === 'VALID';
            const isDNF = status === 'DNF';
            const isDNS = status === 'DNS';
            const isDQ = status === 'DQ' || status === 'DISQUALIFIED';
            const resultData = {
                id: result.id,
                eventId: result.eventId,
                athleteId: result.athleteId,
                registrationId: result.registrationId,
                result: result.result,
                wind: result.wind,
                position: result.position,
                points: result.points,
                isPersonalBest: Boolean(result.isPersonalBest),
                isSeasonBest: Boolean(result.isSeasonBest),
                notes: result.notes,
                reaction: result.reactionTime || null,
                splits: result.splitTimes || null,
                isValid: isValid,
                isDNF: isDNF,
                isDNS: isDNS,
                isDQ: isDQ,
                isNationalRecord: false,
                isWorldRecord: false,
                selectedForDopingControl: false,
                dopingControlStatus: 'NOT_SELECTED',
                createdAt: result.createdAt ? new Date(result.createdAt) : new Date(),
                updatedAt: result.updatedAt ? new Date(result.updatedAt) : new Date(),
            };
            await postgresClient.result.upsert({
                where: { id: resultData.id },
                update: resultData,
                create: resultData,
            });
        }
        console.log(`✅ Zmigrowano ${results.length} wyników\n`);
        console.log('📊 Migracja rekordów...');
        try {
            const records = db.prepare('SELECT * FROM records').all();
            for (const record of records) {
                const recordData = {
                    id: record.id,
                    eventType: record.eventType,
                    category: record.category,
                    gender: record.gender,
                    recordType: record.recordType,
                    result: record.result,
                    athleteName: record.athleteName,
                    venue: record.venue,
                    date: record.date ? new Date(record.date) : new Date(),
                    notes: record.notes,
                    createdById: record.createdById,
                    createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
                    updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
                };
                await postgresClient.record.upsert({
                    where: { id: recordData.id },
                    update: recordData,
                    create: recordData,
                });
            }
            console.log(`✅ Zmigrowano ${records.length} rekordów\n`);
        }
        catch (error) {
            console.log(`⚠️  Pominięto rekordy: ${error.message}\n`);
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
        if (db)
            db.close();
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
        let combinedEvents = 0;
        let records = 0;
        try {
            combinedEvents = await postgresClient.combinedEvent.count();
        }
        catch (e) { }
        try {
            records = await postgresClient.record.count();
        }
        catch (e) { }
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
//# sourceMappingURL=migrate-data-fixed.js.map