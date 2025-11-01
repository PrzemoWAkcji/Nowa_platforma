"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runImplementationTest = runImplementationTest;
const combined_events_service_1 = require("./combined-events.service");
const combined_events_types_1 = require("./types/combined-events.types");
const mockPrismaService = {
    combinedEvent: {
        create: (data) => Promise.resolve({
            id: `test-${Date.now()}`,
            ...data.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        findUnique: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        update: (query) => Promise.resolve({ ...query.data }),
        delete: () => Promise.resolve({ id: 'deleted' }),
    },
    combinedEventResult: {
        create: (data) => Promise.resolve({
            id: `result-${Date.now()}-${Math.random()}`,
            ...data.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        findMany: () => Promise.resolve([]),
        update: (query) => Promise.resolve({ ...query.data }),
        deleteMany: () => Promise.resolve({ count: 0 }),
    },
};
class CombinedEventsImplementationTest {
    service;
    constructor() {
        const mockCacheManager = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
        };
        this.service = new combined_events_service_1.CombinedEventsService(mockPrismaService, mockCacheManager);
    }
    testAvailableEventTypes() {
        console.log('\n🏆 === TEST DOSTĘPNYCH TYPÓW WIELOBOJÓW ===\n');
        const eventTypes = this.service.getAvailableEventTypes();
        console.log(`✅ Znaleziono ${eventTypes.length} typów wielobojów:`);
        const categories = eventTypes.reduce((acc, event) => {
            if (!acc[event.category])
                acc[event.category] = [];
            acc[event.category].push(event);
            return acc;
        }, {});
        Object.entries(categories).forEach(([category, events]) => {
            console.log(`\n📋 ${category} (${events.length} wielobojów):`);
            events.forEach((event) => {
                const officialMark = event.official ? '✅' : '⚠️';
                const mastersNote = event.name.includes('Masters') ? ' [MASTERS]' : '';
                console.log(`  ${officialMark} ${event.name}${mastersNote}`);
                console.log(`     Typ: ${event.type}`);
                console.log(`     Płeć: ${event.gender}, Dyscyplin: ${event.disciplines}`);
                console.log(`     ${event.description}\n`);
            });
        });
        const requiredTypes = [
            combined_events_types_1.CombinedEventType.DECATHLON,
            combined_events_types_1.CombinedEventType.HEPTATHLON,
            combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR,
            combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR,
            combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
            combined_events_types_1.CombinedEventType.HEPTATHLON_MASTERS,
            combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR_MASTERS,
            combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
            combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS,
            combined_events_types_1.CombinedEventType.PENTATHLON_U16_MALE,
            combined_events_types_1.CombinedEventType.PENTATHLON_U16_FEMALE,
        ];
        const foundTypes = eventTypes.map((e) => e.type);
        const missingTypes = requiredTypes.filter((type) => !foundTypes.includes(type));
        if (missingTypes.length === 0) {
            console.log('✅ Wszystkie wymagane typy wielobojów są zaimplementowane!');
        }
        else {
            console.log(`❌ Brakuje typów: ${missingTypes.join(', ')}`);
        }
        return eventTypes;
    }
    testDisciplinesForAllEvents() {
        console.log('\n🎯 === TEST DYSCYPLIN WIELOBOJÓW ===\n');
        const testCases = [
            {
                type: combined_events_types_1.CombinedEventType.DECATHLON,
                gender: 'MALE',
                expectedCount: 10,
                name: 'Dziesięciobój',
            },
            {
                type: combined_events_types_1.CombinedEventType.HEPTATHLON,
                gender: 'FEMALE',
                expectedCount: 7,
                name: 'Siedmiobój',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR,
                gender: 'FEMALE',
                expectedCount: 5,
                name: 'Pięciobój Indoor',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR,
                gender: 'FEMALE',
                expectedCount: 5,
                name: 'Pięciobój Outdoor',
            },
            {
                type: combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
                gender: 'MALE',
                expectedCount: 10,
                name: 'Dziesięciobój Masters',
            },
            {
                type: combined_events_types_1.CombinedEventType.HEPTATHLON_MASTERS,
                gender: 'FEMALE',
                expectedCount: 7,
                name: 'Siedmiobój Masters',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR_MASTERS,
                gender: 'FEMALE',
                expectedCount: 5,
                name: 'Pięciobój Indoor Masters',
            },
            {
                type: combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS,
                gender: 'MALE',
                expectedCount: 5,
                name: 'Pięciobój Rzutowy Masters (M)',
            },
            {
                type: combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS,
                gender: 'FEMALE',
                expectedCount: 5,
                name: 'Pięciobój Rzutowy Masters (K)',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
                gender: 'MALE',
                expectedCount: 5,
                name: 'Pięciobój Outdoor Masters (M)',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
                gender: 'FEMALE',
                expectedCount: 5,
                name: 'Pięciobój Outdoor Masters (K)',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_U16_MALE,
                gender: 'MALE',
                expectedCount: 5,
                name: 'Pięciobój U16 Chłopcy',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_U16_FEMALE,
                gender: 'FEMALE',
                expectedCount: 5,
                name: 'Pięciobój U16 Dziewczęta',
            },
        ];
        let allTestsPassed = true;
        testCases.forEach((testCase) => {
            try {
                const disciplines = this.service.getDisciplinesForEvent(testCase.type, testCase.gender);
                const actualCount = disciplines.length;
                const passed = actualCount === testCase.expectedCount;
                if (!passed)
                    allTestsPassed = false;
                const status = passed ? '✅' : '❌';
                console.log(`${status} ${testCase.name} (${testCase.gender}):`);
                console.log(`   Oczekiwano: ${testCase.expectedCount} dyscyplin, otrzymano: ${actualCount}`);
                console.log(`   Dyscypliny: ${disciplines.join(', ')}\n`);
                if (testCase.type === combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS) {
                    const throwEvents = [
                        combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW,
                        combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                        combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
                        combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                        combined_events_types_1.CombinedEventDiscipline.WEIGHT_THROW,
                    ];
                    const hasAllThrows = throwEvents.every((event) => disciplines.includes(event));
                    if (hasAllThrows) {
                        console.log('   ✅ Wszystkie konkurencje rzutowe obecne');
                    }
                    else {
                        console.log('   ❌ Brakuje niektórych konkurencji rzutowych');
                        allTestsPassed = false;
                    }
                }
                if (testCase.type === combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS) {
                    if (testCase.gender === 'MALE') {
                        const expectedMale = [
                            combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                            combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                            combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
                            combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
                            combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
                        ];
                        const hasCorrectMale = expectedMale.every((event) => disciplines.includes(event));
                        if (hasCorrectMale) {
                            console.log('   ✅ Poprawne dyscypliny dla mężczyzn Masters');
                        }
                        else {
                            console.log('   ❌ Niepoprawne dyscypliny dla mężczyzn Masters');
                            allTestsPassed = false;
                        }
                    }
                    else {
                        const expectedFemale = [
                            combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
                            combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                            combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                            combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                            combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
                        ];
                        const hasCorrectFemale = expectedFemale.every((event) => disciplines.includes(event));
                        if (hasCorrectFemale) {
                            console.log('   ✅ Poprawne dyscypliny dla kobiet Masters');
                        }
                        else {
                            console.log('   ❌ Niepoprawne dyscypliny dla kobiet Masters');
                            allTestsPassed = false;
                        }
                    }
                }
            }
            catch (error) {
                console.log(`❌ ${testCase.name}: BŁĄD - ${error.message}\n`);
                allTestsPassed = false;
            }
        });
        if (allTestsPassed) {
            console.log('✅ Wszystkie testy dyscyplin przeszły pomyślnie!');
        }
        else {
            console.log('❌ Niektóre testy dyscyplin nie przeszły!');
        }
        return allTestsPassed;
    }
    testScoring() {
        console.log('\n🔢 === TEST OBLICZANIA PUNKTÓW ===\n');
        const scoringTests = [
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
                performance: '10.85',
                gender: 'MALE',
                description: '100m męski',
                expectedRange: [800, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
                performance: '13.15',
                gender: 'FEMALE',
                description: '100m przez płotki żeński',
                expectedRange: [1000, 1200],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
                performance: '23.85',
                gender: 'MALE',
                description: '200m',
                expectedRange: [800, 1000],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
                performance: '2:08.50',
                gender: 'FEMALE',
                description: '800m',
                expectedRange: [900, 1100],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
                performance: '4:25.30',
                gender: 'MALE',
                description: '1500m',
                expectedRange: [700, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                performance: '2.05',
                gender: 'MALE',
                description: 'Skok wzwyż',
                expectedRange: [800, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                performance: '7.45',
                gender: 'MALE',
                description: 'Skok w dal',
                expectedRange: [850, 950],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.POLE_VAULT,
                performance: '4.80',
                gender: 'MALE',
                description: 'Skok o tyczce',
                expectedRange: [800, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                performance: '15.20',
                gender: 'MALE',
                description: 'Pchnięcie kulą męskie',
                expectedRange: [750, 850],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                performance: '14.50',
                gender: 'FEMALE',
                description: 'Pchnięcie kulą żeńskie',
                expectedRange: [800, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
                performance: '45.80',
                gender: 'MALE',
                description: 'Rzut dyskiem',
                expectedRange: [750, 850],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                performance: '62.50',
                gender: 'MALE',
                description: 'Rzut oszczepem męski',
                expectedRange: [750, 850],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                performance: '48.20',
                gender: 'FEMALE',
                description: 'Rzut oszczepem żeński',
                expectedRange: [800, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW,
                performance: '45.20',
                gender: 'MALE',
                description: 'Rzut młotem',
                expectedRange: [700, 800],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.WEIGHT_THROW,
                performance: '15.80',
                gender: 'MALE',
                description: 'Rzut wagą',
                expectedRange: [700, 800],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_80M_HURDLES,
                performance: '12.85',
                gender: 'FEMALE',
                description: '80m przez płotki U16',
                expectedRange: [700, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_600M,
                performance: '1:38.50',
                gender: 'FEMALE',
                description: '600m U16',
                expectedRange: [700, 900],
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_1000M,
                performance: '2:58.30',
                gender: 'MALE',
                description: '1000m U16',
                expectedRange: [600, 800],
            },
        ];
        let allTestsPassed = true;
        scoringTests.forEach((test) => {
            try {
                const points = this.service.calculatePoints(test.discipline, test.performance, test.gender);
                const inRange = points >= test.expectedRange[0] && points <= test.expectedRange[1];
                if (!inRange)
                    allTestsPassed = false;
                const status = inRange ? '✅' : '❌';
                console.log(`${status} ${test.description}: ${test.performance} = ${points} pkt (oczekiwano: ${test.expectedRange[0]}-${test.expectedRange[1]})`);
            }
            catch (error) {
                console.log(`❌ ${test.description}: BŁĄD - ${error.message}`);
                allTestsPassed = false;
            }
        });
        if (allTestsPassed) {
            console.log('\n✅ Wszystkie testy punktacji przeszły pomyślnie!');
        }
        else {
            console.log('\n❌ Niektóre testy punktacji nie przeszły!');
        }
        return allTestsPassed;
    }
    testValidation() {
        console.log('\n✅ === TEST WALIDACJI WYNIKÓW ===\n');
        const validationTests = [
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
                performance: '10.85',
                expected: true,
                description: 'Poprawny czas 100m',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                performance: '2.05',
                expected: true,
                description: 'Poprawna wysokość skoku',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                performance: '15.20',
                expected: true,
                description: 'Poprawny rzut kulą',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW,
                performance: '45.20',
                expected: true,
                description: 'Poprawny rzut młotem',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.WEIGHT_THROW,
                performance: '15.80',
                expected: true,
                description: 'Poprawny rzut wagą',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_80M_HURDLES,
                performance: '12.85',
                expected: true,
                description: 'Poprawny czas 80m płotki U16',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_600M,
                performance: '1:38.50',
                expected: true,
                description: 'Poprawny czas 600m U16',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
                performance: '8.50',
                expected: false,
                description: 'Za szybki czas 100m',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
                performance: '16.00',
                expected: false,
                description: 'Za wolny czas 100m',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                performance: '0.50',
                expected: false,
                description: 'Za niska wysokość skoku',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                performance: '3.50',
                expected: false,
                description: 'Za wysoka wysokość skoku',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                performance: '3.00',
                expected: false,
                description: 'Za krótki rzut kulą',
            },
            {
                discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                performance: '30.00',
                expected: false,
                description: 'Za daleki rzut kulą',
            },
        ];
        let allTestsPassed = true;
        validationTests.forEach((test) => {
            const isValid = this.service.validatePerformance(test.discipline, test.performance);
            const passed = isValid === test.expected;
            if (!passed)
                allTestsPassed = false;
            const status = passed ? '✅' : '❌';
            const validityText = isValid ? 'POPRAWNY' : 'NIEPOPRAWNY';
            console.log(`${status} ${test.description}: ${test.performance} - ${validityText}`);
        });
        if (allTestsPassed) {
            console.log('\n✅ Wszystkie testy walidacji przeszły pomyślnie!');
        }
        else {
            console.log('\n❌ Niektóre testy walidacji nie przeszły!');
        }
        return allTestsPassed;
    }
    async testEventCreation() {
        console.log('\n🏗️ === TEST TWORZENIA WIELOBOJÓW ===\n');
        const creationTests = [
            {
                eventType: combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
                athleteId: 'athlete-masters-001',
                competitionId: 'comp-masters-2024',
                gender: 'MALE',
                description: 'Dziesięciobój Masters',
            },
            {
                eventType: combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS,
                athleteId: 'athlete-throws-male-001',
                competitionId: 'comp-masters-2024',
                gender: 'MALE',
                description: 'Pięciobój Rzutowy Masters (M)',
            },
            {
                eventType: combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS,
                athleteId: 'athlete-throws-female-001',
                competitionId: 'comp-masters-2024',
                gender: 'FEMALE',
                description: 'Pięciobój Rzutowy Masters (K)',
            },
            {
                eventType: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
                athleteId: 'athlete-outdoor-male-001',
                competitionId: 'comp-masters-2024',
                gender: 'MALE',
                description: 'Pięciobój Outdoor Masters (M)',
            },
            {
                eventType: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
                athleteId: 'athlete-outdoor-female-001',
                competitionId: 'comp-masters-2024',
                gender: 'FEMALE',
                description: 'Pięciobój Outdoor Masters (K)',
            },
        ];
        let allTestsPassed = true;
        for (const test of creationTests) {
            try {
                console.log(`🔨 Testowanie: ${test.description}`);
                const combinedEvent = await this.service.createCombinedEvent(test);
                const disciplines = this.service.getDisciplinesForEvent(test.eventType, test.gender);
                console.log(`   ✅ Utworzono wielobój ID: ${combinedEvent.id}`);
                console.log(`   📋 Dyscypliny (${disciplines.length}): ${disciplines.join(', ')}`);
                console.log('');
            }
            catch (error) {
                console.log(`   ❌ Błąd: ${error.message}\n`);
                allTestsPassed = false;
            }
        }
        if (allTestsPassed) {
            console.log('✅ Wszystkie testy tworzenia wielobojów przeszły pomyślnie!');
        }
        else {
            console.log('❌ Niektóre testy tworzenia wielobojów nie przeszły!');
        }
        return allTestsPassed;
    }
    async runAllTests() {
        console.log('🧪 === KOMPLETNY TEST IMPLEMENTACJI OFICJALNYCH WIELOBOJÓW ===');
        console.log('Zgodnie z przepisami World Athletics i WMA\n');
        const results = {
            eventTypes: false,
            disciplines: false,
            scoring: false,
            validation: false,
            creation: false,
        };
        try {
            this.testAvailableEventTypes();
            results.eventTypes = true;
            results.disciplines = this.testDisciplinesForAllEvents();
            results.scoring = this.testScoring();
            results.validation = this.testValidation();
            results.creation = await this.testEventCreation();
        }
        catch (error) {
            console.error('❌ Błąd podczas testów:', error);
        }
        console.log('\n📊 === PODSUMOWANIE TESTÓW ===\n');
        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length;
        Object.entries(results).forEach(([testName, passed]) => {
            const status = passed ? '✅' : '❌';
            console.log(`${status} ${testName.toUpperCase()}: ${passed ? 'PRZESZEDŁ' : 'NIE PRZESZEDŁ'}`);
        });
        console.log(`\n🎯 WYNIK KOŃCOWY: ${passedTests}/${totalTests} testów przeszło pomyślnie`);
        if (passedTests === totalTests) {
            console.log('\n🎉 WSZYSTKIE TESTY PRZESZŁY! Implementacja jest kompletna i zgodna z przepisami.');
            console.log('\n📋 ZAIMPLEMENTOWANE WIELOBOJE:');
            console.log('✅ Wszystkie oficjalne wieloboje World Athletics');
            console.log('✅ Wszystkie wieloboje Masters (WMA) z oznaczeniem');
            console.log('✅ Niestandardowe wieloboje U16 (zachowane)');
            console.log('✅ Poprawne obliczanie punktów według tabel IAAF/WA');
            console.log('✅ Walidacja wyników z realistycznymi zakresami');
            console.log('✅ Różne dyscypliny dla płci w Pięcioboju Outdoor Masters');
            console.log('✅ Specjalny Pięciobój Rzutowy Masters (tylko rzuty)');
        }
        else {
            console.log('\n⚠️ NIEKTÓRE TESTY NIE PRZESZŁY. Sprawdź implementację.');
        }
        return passedTests === totalTests;
    }
}
async function runImplementationTest() {
    const test = new CombinedEventsImplementationTest();
    return await test.runAllTests();
}
if (require.main === module) {
    runImplementationTest().catch(console.error);
}
//# sourceMappingURL=test-implementation.js.map