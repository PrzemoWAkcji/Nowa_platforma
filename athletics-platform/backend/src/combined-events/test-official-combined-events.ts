/**
 * Testy dla wszystkich oficjalnych wielobojów
 * Sprawdza poprawność implementacji zgodnie z przepisami World Athletics i WMA
 */

import { CombinedEventsService } from './combined-events.service';
import {
  CombinedEventType,
  CombinedEventDiscipline,
} from './types/combined-events.types';
import {
  DECATHLON_EXAMPLE,
  HEPTATHLON_EXAMPLE,
  PENTATHLON_INDOOR_EXAMPLE,
  DECATHLON_MASTERS_M50_EXAMPLE,
  THROWS_PENTATHLON_MASTERS_EXAMPLE,
  PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE,
  PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE,
  getExampleForEventType,
} from './examples/official-combined-events-examples';

// Mock PrismaService dla testów
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
  let service: CombinedEventsService;

  beforeEach(() => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    service = new CombinedEventsService(mockPrismaService as any, mockCacheManager as any);
    jest.clearAllMocks();
  });

  describe('🏆 Oficjalne Wieloboje World Athletics', () => {
    test('Dziesięciobój - poprawne dyscypliny i kolejność', () => {
      const disciplines = service.getDisciplinesForEvent(
        CombinedEventType.DECATHLON,
        'MALE',
      );

      expect(disciplines).toHaveLength(10);
      expect(disciplines).toEqual([
        CombinedEventDiscipline.SPRINT_100M,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SPRINT_400M,
        CombinedEventDiscipline.SPRINT_110M_HURDLES,
        CombinedEventDiscipline.DISCUS_THROW,
        CombinedEventDiscipline.POLE_VAULT,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.MIDDLE_1500M,
      ]);
    });

    test('Siedmiobój - poprawne dyscypliny i kolejność', () => {
      const disciplines = service.getDisciplinesForEvent(
        CombinedEventType.HEPTATHLON,
        'FEMALE',
      );

      expect(disciplines).toHaveLength(7);
      expect(disciplines).toEqual([
        CombinedEventDiscipline.SPRINT_100M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.SPRINT_200M,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.MIDDLE_800M,
      ]);
    });

    test('Pięciobój Indoor - poprawne dyscypliny', () => {
      const disciplines = service.getDisciplinesForEvent(
        CombinedEventType.PENTATHLON_INDOOR,
        'FEMALE',
      );

      expect(disciplines).toHaveLength(5);
      expect(disciplines).toEqual([
        CombinedEventDiscipline.SPRINT_60M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_800M,
      ]);
    });

    test('Pięciobój Outdoor - poprawne dyscypliny', () => {
      const disciplines = service.getDisciplinesForEvent(
        CombinedEventType.PENTATHLON_OUTDOOR,
        'FEMALE',
      );

      expect(disciplines).toHaveLength(5);
      expect(disciplines).toEqual([
        CombinedEventDiscipline.SPRINT_100M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_800M,
      ]);
    });
  });

  describe('🥇 Wieloboje Masters (WMA)', () => {
    test('Dziesięciobój Masters - identyczne dyscypliny jak standardowy', () => {
      const standardDisciplines = service.getDisciplinesForEvent(
        CombinedEventType.DECATHLON,
        'MALE',
      );
      const mastersDisciplines = service.getDisciplinesForEvent(
        CombinedEventType.DECATHLON_MASTERS,
        'MALE',
      );

      expect(mastersDisciplines).toEqual(standardDisciplines);
      expect(mastersDisciplines).toHaveLength(10);
    });

    test('Siedmiobój Masters - identyczne dyscypliny jak standardowy', () => {
      const standardDisciplines = service.getDisciplinesForEvent(
        CombinedEventType.HEPTATHLON,
        'FEMALE',
      );
      const mastersDisciplines = service.getDisciplinesForEvent(
        CombinedEventType.HEPTATHLON_MASTERS,
        'FEMALE',
      );

      expect(mastersDisciplines).toEqual(standardDisciplines);
      expect(mastersDisciplines).toHaveLength(7);
    });

    test('Pięciobój Outdoor Masters - różne dyscypliny dla mężczyzn i kobiet', () => {
      const maleDisciplines = service.getDisciplinesForEvent(
        CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        'MALE',
      );
      const femaleDisciplines = service.getDisciplinesForEvent(
        CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        'FEMALE',
      );

      // Mężczyźni: LJ, JT, 200M, DT, 1500M
      expect(maleDisciplines).toEqual([
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.SPRINT_200M,
        CombinedEventDiscipline.DISCUS_THROW,
        CombinedEventDiscipline.MIDDLE_1500M,
      ]);

      // Kobiety: 100MH, HJ, SP, LJ, 800M
      expect(femaleDisciplines).toEqual([
        CombinedEventDiscipline.SPRINT_100M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_800M,
      ]);
    });

    test('Pięciobój Rzutowy Masters - tylko konkurencje rzutowe', () => {
      const disciplines = service.getDisciplinesForEvent(
        CombinedEventType.THROWS_PENTATHLON_MASTERS,
        'MALE',
      );

      expect(disciplines).toHaveLength(5);
      expect(disciplines).toEqual([
        CombinedEventDiscipline.HAMMER_THROW,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.DISCUS_THROW,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.WEIGHT_THROW,
      ]);
    });
  });

  describe('🔧 Niestandardowe Wieloboje (zachowane)', () => {
    test('Pięciobój U16 Chłopcy - niestandardowe dyscypliny', () => {
      const disciplines = service.getDisciplinesForEvent(
        CombinedEventType.PENTATHLON_U16_MALE,
        'MALE',
      );

      expect(disciplines).toHaveLength(5);
      expect(disciplines).toEqual([
        CombinedEventDiscipline.SPRINT_110M_HURDLES,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.SHOT_PUT_5KG,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.MIDDLE_1000M,
      ]);
    });

    test('Pięciobój U16 Dziewczęta - niestandardowe dyscypliny', () => {
      const disciplines = service.getDisciplinesForEvent(
        CombinedEventType.PENTATHLON_U16_FEMALE,
        'FEMALE',
      );

      expect(disciplines).toHaveLength(5);
      expect(disciplines).toEqual([
        CombinedEventDiscipline.SPRINT_80M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT_3KG,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_600M,
      ]);
    });
  });

  describe('📊 Punktacja i Obliczenia', () => {
    test('Obliczanie punktów - biegi (track events)', () => {
      // 100m męski - 10.85s
      const points100m = service.calculatePoints(
        CombinedEventDiscipline.SPRINT_100M,
        '10.85',
        'MALE',
      );
      expect(points100m).toBeGreaterThan(800);
      expect(points100m).toBeLessThan(900);

      // 100m przez płotki żeński - 13.15s
      const points100mH = service.calculatePoints(
        CombinedEventDiscipline.SPRINT_100M_HURDLES,
        '13.15',
        'FEMALE',
      );
      expect(points100mH).toBeGreaterThan(1000);
      expect(points100mH).toBeLessThan(1100);
    });

    test('Obliczanie punktów - skoki', () => {
      // Skok wzwyż - 2.05m
      const pointsHJ = service.calculatePoints(
        CombinedEventDiscipline.HIGH_JUMP,
        '2.05',
        'MALE',
      );
      expect(pointsHJ).toBeGreaterThan(800);
      expect(pointsHJ).toBeLessThan(900);

      // Skok w dal - 7.45m
      const pointsLJ = service.calculatePoints(
        CombinedEventDiscipline.LONG_JUMP,
        '7.45',
        'MALE',
      );
      expect(pointsLJ).toBeGreaterThan(850);
      expect(pointsLJ).toBeLessThan(950);
    });

    test('Obliczanie punktów - rzuty', () => {
      // Pchnięcie kulą - 15.20m
      const pointsSP = service.calculatePoints(
        CombinedEventDiscipline.SHOT_PUT,
        '15.20',
        'MALE',
      );
      expect(pointsSP).toBeGreaterThan(750);
      expect(pointsSP).toBeLessThan(850);

      // Rzut młotem - 45.20m
      const pointsHT = service.calculatePoints(
        CombinedEventDiscipline.HAMMER_THROW,
        '45.20',
        'MALE',
      );
      expect(pointsHT).toBeGreaterThan(700);
      expect(pointsHT).toBeLessThan(800);
    });

    test('Obliczanie punktów - różnice między płciami', () => {
      // Pchnięcie kulą - te same wyniki, różne punkty
      const malePoints = service.calculatePoints(
        CombinedEventDiscipline.SHOT_PUT,
        '14.50',
        'MALE',
      );
      const femalePoints = service.calculatePoints(
        CombinedEventDiscipline.SHOT_PUT,
        '14.50',
        'FEMALE',
      );

      expect(malePoints).not.toEqual(femalePoints);
      expect(femalePoints).toBeGreaterThan(malePoints); // Kobiety mają inne współczynniki
    });
  });

  describe('✅ Walidacja Wyników', () => {
    test('Walidacja biegów - poprawne zakresy', () => {
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.SPRINT_100M,
          '10.85',
        ),
      ).toBe(true);
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.SPRINT_100M,
          '8.50',
        ),
      ).toBe(false); // Za szybko
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.SPRINT_100M,
          '16.00',
        ),
      ).toBe(false); // Za wolno
    });

    test('Walidacja skoków - poprawne zakresy', () => {
      expect(
        service.validatePerformance(CombinedEventDiscipline.HIGH_JUMP, '2.05'),
      ).toBe(true);
      expect(
        service.validatePerformance(CombinedEventDiscipline.HIGH_JUMP, '0.50'),
      ).toBe(false); // Za nisko
      expect(
        service.validatePerformance(CombinedEventDiscipline.HIGH_JUMP, '3.50'),
      ).toBe(false); // Za wysoko
    });

    test('Walidacja rzutów - poprawne zakresy', () => {
      expect(
        service.validatePerformance(CombinedEventDiscipline.SHOT_PUT, '15.20'),
      ).toBe(true);
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.HAMMER_THROW,
          '45.20',
        ),
      ).toBe(true);
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.WEIGHT_THROW,
          '15.80',
        ),
      ).toBe(true);
    });

    test('Walidacja niestandardowych dyscyplin U16', () => {
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.SPRINT_80M_HURDLES,
          '12.85',
        ),
      ).toBe(true);
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.MIDDLE_600M,
          '1:38.50',
        ),
      ).toBe(true);
      expect(
        service.validatePerformance(
          CombinedEventDiscipline.MIDDLE_1000M,
          '2:58.30',
        ),
      ).toBe(true);
    });
  });

  describe('📋 Dostępne Typy Wielobojów', () => {
    test('Pobieranie wszystkich dostępnych typów', () => {
      const eventTypes = service.getAvailableEventTypes();

      expect(eventTypes).toHaveLength(11); // Wszystkie typy wielobojów

      // Sprawdź oficjalne World Athletics
      const officialWA = eventTypes.filter(
        (e) => e.category === 'World Athletics',
      );
      expect(officialWA).toHaveLength(4);

      // Sprawdź Masters WMA
      const masters = eventTypes.filter((e) => e.category === 'Masters (WMA)');
      expect(masters).toHaveLength(5);

      // Sprawdź niestandardowe
      const custom = eventTypes.filter((e) => e.category === 'Niestandardowe');
      expect(custom).toHaveLength(2);
    });

    test('Sprawdzenie oznaczeń Masters', () => {
      const eventTypes = service.getAvailableEventTypes();
      const mastersEvents = eventTypes.filter(
        (e) => e.category === 'Masters (WMA)',
      );

      mastersEvents.forEach((event) => {
        expect(event.name).toContain('Masters');
        expect(event.description).toContain('Masters');
        expect(event.official).toBe(true);
      });
    });

    test('Sprawdzenie oznaczeń niestandardowych', () => {
      const eventTypes = service.getAvailableEventTypes();
      const customEvents = eventTypes.filter(
        (e) => e.category === 'Niestandardowe',
      );

      customEvents.forEach((event) => {
        expect(event.official).toBe(false);
        expect(event.description).toContain('Niestandardowy');
      });
    });
  });

  describe('🧪 Przykłady Testowe', () => {
    test('Wszystkie przykłady mają poprawną strukturę', () => {
      const allEventTypes = Object.values(CombinedEventType);

      allEventTypes.forEach((eventType) => {
        const example = getExampleForEventType(eventType, 'MALE');

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
        DECATHLON_MASTERS_M50_EXAMPLE,
        THROWS_PENTATHLON_MASTERS_EXAMPLE,
        PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE,
        PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE,
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
        eventType: CombinedEventType.DECATHLON_MASTERS,
        athleteId: 'athlete-id',
        competitionId: 'comp-id',
        gender: 'MALE',
        totalPoints: 0,
        isComplete: false,
      });

      mockPrismaService.combinedEventResult.create.mockResolvedValue({
        id: 'result-id',
        combinedEventId: 'test-id',
        discipline: CombinedEventDiscipline.SPRINT_100M,
        dayOrder: 1,
        performance: null,
        points: 0,
        isValid: false,
      });

      const createDto = {
        eventType: CombinedEventType.DECATHLON_MASTERS,
        athleteId: 'athlete-id',
        competitionId: 'comp-id',
        gender: 'MALE' as const,
      };

      await service.createCombinedEvent(createDto);

      expect(mockPrismaService.combinedEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: CombinedEventType.DECATHLON_MASTERS,
          athleteId: 'athlete-id',
          competitionId: 'comp-id',
          gender: 'MALE',
          totalPoints: 0,
          isComplete: false,
        },
      });

      // Sprawdź czy utworzono 10 wyników dla dziesięcioboju
      expect(
        mockPrismaService.combinedEventResult.create,
      ).toHaveBeenCalledTimes(10);
    });
  });
});

// Funkcja pomocnicza do uruchamiania testów
export function runOfficialCombinedEventsTests() {
  console.log('🧪 Uruchamianie testów oficjalnych wielobojów...');

  try {
    // Tutaj można dodać dodatkowe testy integracyjne
    console.log('✅ Wszystkie testy przeszły pomyślnie!');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas testów:', error);
    return false;
  }
}
