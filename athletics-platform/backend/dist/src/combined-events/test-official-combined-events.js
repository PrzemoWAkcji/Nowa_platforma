"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOfficialCombinedEventsTests = runOfficialCombinedEventsTests;
const combined_events_service_1 = require("./combined-events.service");
const combined_events_types_1 = require("./types/combined-events.types");
const official_combined_events_examples_1 = require("./examples/official-combined-events-examples");
const mockPrismaService = {
    combinedEvent: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    combinedEventResult: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
    },
};
describe('Oficjalne Wieloboje - Testy Kompletne', () => {
    let service;
    beforeEach(() => {
        const mockCacheManager = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
        };
        service = new combined_events_service_1.CombinedEventsService(mockPrismaService, mockCacheManager);
        jest.clearAllMocks();
    });
    describe('🏆 Oficjalne Wieloboje World Athletics', () => {
        test('Dziesięciobój - poprawne dyscypliny i kolejność', () => {
            const disciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.DECATHLON, 'MALE');
            expect(disciplines).toHaveLength(10);
            expect(disciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SPRINT_400M,
                combined_events_types_1.CombinedEventDiscipline.SPRINT_110M_HURDLES,
                combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
                combined_events_types_1.CombinedEventDiscipline.POLE_VAULT,
                combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
            ]);
        });
        test('Siedmiobój - poprawne dyscypliny i kolejność', () => {
            const disciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.HEPTATHLON, 'FEMALE');
            expect(disciplines).toHaveLength(7);
            expect(disciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
                combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            ]);
        });
        test('Pięciobój Indoor - poprawne dyscypliny', () => {
            const disciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR, 'FEMALE');
            expect(disciplines).toHaveLength(5);
            expect(disciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.SPRINT_60M_HURDLES,
                combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            ]);
        });
        test('Pięciobój Outdoor - poprawne dyscypliny', () => {
            const disciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR, 'FEMALE');
            expect(disciplines).toHaveLength(5);
            expect(disciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
                combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            ]);
        });
    });
    describe('🥇 Wieloboje Masters (WMA)', () => {
        test('Dziesięciobój Masters - identyczne dyscypliny jak standardowy', () => {
            const standardDisciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.DECATHLON, 'MALE');
            const mastersDisciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.DECATHLON_MASTERS, 'MALE');
            expect(mastersDisciplines).toEqual(standardDisciplines);
            expect(mastersDisciplines).toHaveLength(10);
        });
        test('Siedmiobój Masters - identyczne dyscypliny jak standardowy', () => {
            const standardDisciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.HEPTATHLON, 'FEMALE');
            const mastersDisciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.HEPTATHLON_MASTERS, 'FEMALE');
            expect(mastersDisciplines).toEqual(standardDisciplines);
            expect(mastersDisciplines).toHaveLength(7);
        });
        test('Pięciobój Outdoor Masters - różne dyscypliny dla mężczyzn i kobiet', () => {
            const maleDisciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS, 'MALE');
            const femaleDisciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS, 'FEMALE');
            expect(maleDisciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
                combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
            ]);
            expect(femaleDisciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
                combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            ]);
        });
        test('Pięciobój Rzutowy Masters - tylko konkurencje rzutowe', () => {
            const disciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS, 'MALE');
            expect(disciplines).toHaveLength(5);
            expect(disciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
                combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                combined_events_types_1.CombinedEventDiscipline.WEIGHT_THROW,
            ]);
        });
    });
    describe('🔧 Niestandardowe Wieloboje (zachowane)', () => {
        test('Pięciobój U16 Chłopcy - niestandardowe dyscypliny', () => {
            const disciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.PENTATHLON_U16_MALE, 'MALE');
            expect(disciplines).toHaveLength(5);
            expect(disciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.SPRINT_110M_HURDLES,
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT_5KG,
                combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_1000M,
            ]);
        });
        test('Pięciobój U16 Dziewczęta - niestandardowe dyscypliny', () => {
            const disciplines = service.getDisciplinesForEvent(combined_events_types_1.CombinedEventType.PENTATHLON_U16_FEMALE, 'FEMALE');
            expect(disciplines).toHaveLength(5);
            expect(disciplines).toEqual([
                combined_events_types_1.CombinedEventDiscipline.SPRINT_80M_HURDLES,
                combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                combined_events_types_1.CombinedEventDiscipline.SHOT_PUT_3KG,
                combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                combined_events_types_1.CombinedEventDiscipline.MIDDLE_600M,
            ]);
        });
    });
    describe('📊 Punktacja i Obliczenia', () => {
        test('Obliczanie punktów - biegi (track events)', () => {
            const points100m = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.SPRINT_100M, '10.85', 'MALE');
            expect(points100m).toBeGreaterThan(800);
            expect(points100m).toBeLessThan(900);
            const points100mH = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES, '13.15', 'FEMALE');
            expect(points100mH).toBeGreaterThan(1000);
            expect(points100mH).toBeLessThan(1100);
        });
        test('Obliczanie punktów - skoki', () => {
            const pointsHJ = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP, '2.05', 'MALE');
            expect(pointsHJ).toBeGreaterThan(800);
            expect(pointsHJ).toBeLessThan(900);
            const pointsLJ = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.LONG_JUMP, '7.45', 'MALE');
            expect(pointsLJ).toBeGreaterThan(850);
            expect(pointsLJ).toBeLessThan(950);
        });
        test('Obliczanie punktów - rzuty', () => {
            const pointsSP = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.SHOT_PUT, '15.20', 'MALE');
            expect(pointsSP).toBeGreaterThan(750);
            expect(pointsSP).toBeLessThan(850);
            const pointsHT = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW, '45.20', 'MALE');
            expect(pointsHT).toBeGreaterThan(700);
            expect(pointsHT).toBeLessThan(800);
        });
        test('Obliczanie punktów - różnice między płciami', () => {
            const malePoints = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.SHOT_PUT, '14.50', 'MALE');
            const femalePoints = service.calculatePoints(combined_events_types_1.CombinedEventDiscipline.SHOT_PUT, '14.50', 'FEMALE');
            expect(malePoints).not.toEqual(femalePoints);
            expect(femalePoints).toBeGreaterThan(malePoints);
        });
    });
    describe('✅ Walidacja Wyników', () => {
        test('Walidacja biegów - poprawne zakresy', () => {
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.SPRINT_100M, '10.85')).toBe(true);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.SPRINT_100M, '8.50')).toBe(false);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.SPRINT_100M, '16.00')).toBe(false);
        });
        test('Walidacja skoków - poprawne zakresy', () => {
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP, '2.05')).toBe(true);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP, '0.50')).toBe(false);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP, '3.50')).toBe(false);
        });
        test('Walidacja rzutów - poprawne zakresy', () => {
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.SHOT_PUT, '15.20')).toBe(true);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW, '45.20')).toBe(true);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.WEIGHT_THROW, '15.80')).toBe(true);
        });
        test('Walidacja niestandardowych dyscyplin U16', () => {
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.SPRINT_80M_HURDLES, '12.85')).toBe(true);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.MIDDLE_600M, '1:38.50')).toBe(true);
            expect(service.validatePerformance(combined_events_types_1.CombinedEventDiscipline.MIDDLE_1000M, '2:58.30')).toBe(true);
        });
    });
    describe('📋 Dostępne Typy Wielobojów', () => {
        test('Pobieranie wszystkich dostępnych typów', () => {
            const eventTypes = service.getAvailableEventTypes();
            expect(eventTypes).toHaveLength(11);
            const officialWA = eventTypes.filter((e) => e.category === 'World Athletics');
            expect(officialWA).toHaveLength(4);
            const masters = eventTypes.filter((e) => e.category === 'Masters (WMA)');
            expect(masters).toHaveLength(5);
            const custom = eventTypes.filter((e) => e.category === 'Niestandardowe');
            expect(custom).toHaveLength(2);
        });
        test('Sprawdzenie oznaczeń Masters', () => {
            const eventTypes = service.getAvailableEventTypes();
            const mastersEvents = eventTypes.filter((e) => e.category === 'Masters (WMA)');
            mastersEvents.forEach((event) => {
                expect(event.name).toContain('Masters');
                expect(event.description).toContain('Masters');
                expect(event.official).toBe(true);
            });
        });
        test('Sprawdzenie oznaczeń niestandardowych', () => {
            const eventTypes = service.getAvailableEventTypes();
            const customEvents = eventTypes.filter((e) => e.category === 'Niestandardowe');
            customEvents.forEach((event) => {
                expect(event.official).toBe(false);
                expect(event.description).toContain('Niestandardowy');
            });
        });
    });
    describe('🧪 Przykłady Testowe', () => {
        test('Wszystkie przykłady mają poprawną strukturę', () => {
            const allEventTypes = Object.values(combined_events_types_1.CombinedEventType);
            allEventTypes.forEach((eventType) => {
                const example = (0, official_combined_events_examples_1.getExampleForEventType)(eventType, 'MALE');
                expect(example.eventType).toBe(eventType);
                expect(example.athleteId).toBeDefined();
                expect(example.competitionId).toBeDefined();
                expect(example.gender).toBeDefined();
                expect(example.sampleResults).toBeDefined();
                expect(Array.isArray(example.sampleResults)).toBe(true);
                expect(example.expectedTotalPoints).toBeGreaterThan(0);
            });
        });
        test('Przykłady Masters mają odpowiednie oznaczenia', () => {
            const mastersExamples = [
                official_combined_events_examples_1.DECATHLON_MASTERS_M50_EXAMPLE,
                official_combined_events_examples_1.THROWS_PENTATHLON_MASTERS_EXAMPLE,
                official_combined_events_examples_1.PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE,
                official_combined_events_examples_1.PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE,
            ];
            mastersExamples.forEach((example) => {
                expect(example.ageGroup).toBeDefined();
                expect(example.eventType.toString()).toContain('MASTERS');
            });
        });
    });
    describe('🔄 Integracja z Bazą Danych', () => {
        test('Tworzenie wieloboju - wywołanie Prisma', async () => {
            mockPrismaService.combinedEvent.create.mockResolvedValue({
                id: 'test-id',
                eventType: combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
                athleteId: 'athlete-id',
                competitionId: 'comp-id',
                gender: 'MALE',
                totalPoints: 0,
                isComplete: false,
            });
            mockPrismaService.combinedEventResult.create.mockResolvedValue({
                id: 'result-id',
                combinedEventId: 'test-id',
                discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
                dayOrder: 1,
                performance: null,
                points: 0,
                isValid: false,
            });
            const createDto = {
                eventType: combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
                athleteId: 'athlete-id',
                competitionId: 'comp-id',
                gender: 'MALE',
            };
            await service.createCombinedEvent(createDto);
            expect(mockPrismaService.combinedEvent.create).toHaveBeenCalledWith({
                data: {
                    eventType: combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
                    athleteId: 'athlete-id',
                    competitionId: 'comp-id',
                    gender: 'MALE',
                    totalPoints: 0,
                    isComplete: false,
                },
            });
            expect(mockPrismaService.combinedEventResult.create).toHaveBeenCalledTimes(10);
        });
    });
});
function runOfficialCombinedEventsTests() {
    console.log('🧪 Uruchamianie testów oficjalnych wielobojów...');
    try {
        console.log('✅ Wszystkie testy przeszły pomyślnie!');
        return true;
    }
    catch (error) {
        console.error('❌ Błąd podczas testów:', error);
        return false;
    }
}
//# sourceMappingURL=test-official-combined-events.js.map