/**
 * Test implementacji wszystkich oficjalnych wielobojów
 * Sprawdza poprawność działania bez potrzeby uruchomienia serwera
 */

import { CombinedEventsService } from './combined-events.service';
import {
  CombinedEventType,
  CombinedEventDiscipline,
} from './types/combined-events.types';

// Mock PrismaService
const mockPrismaService = {
  combinedEvent: {
    create: (data: any) =>
      Promise.resolve({
        id: `test-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    update: (query: any) => Promise.resolve({ ...query.data }),
    delete: () => Promise.resolve({ id: 'deleted' }),
  },
  combinedEventResult: {
    create: (data: any) =>
      Promise.resolve({
        id: `result-${Date.now()}-${Math.random()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    findMany: () => Promise.resolve([]),
    update: (query: any) => Promise.resolve({ ...query.data }),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
};

class CombinedEventsImplementationTest {
  private service: CombinedEventsService;

  constructor() {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    this.service = new CombinedEventsService(mockPrismaService as any, mockCacheManager as any);
  }

  /**
   * Test wszystkich dostępnych typów wielobojów
   */
  testAvailableEventTypes() {
    console.log('\n🏆 === TEST DOSTĘPNYCH TYPÓW WIELOBOJÓW ===\n');

    const eventTypes = this.service.getAvailableEventTypes();

    console.log(`✅ Znaleziono ${eventTypes.length} typów wielobojów:`);

    // Grupowanie według kategorii
    const categories = eventTypes.reduce(
      (acc, event) => {
        if (!acc[event.category]) acc[event.category] = [];
        acc[event.category].push(event);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    Object.entries(categories).forEach(([category, events]) => {
      console.log(`\n📋 ${category} (${events.length} wielobojów):`);
      events.forEach((event) => {
        const officialMark = event.official ? '✅' : '⚠️';
        const mastersNote = event.name.includes('Masters') ? ' [MASTERS]' : '';
        console.log(`  ${officialMark} ${event.name}${mastersNote}`);
        console.log(`     Typ: ${event.type}`);
        console.log(
          `     Płeć: ${event.gender}, Dyscyplin: ${event.disciplines}`,
        );
        console.log(`     ${event.description}\n`);
      });
    });

    // Sprawdzenie czy wszystkie wymagane typy są obecne
    const requiredTypes = [
      CombinedEventType.DECATHLON,
      CombinedEventType.HEPTATHLON,
      CombinedEventType.PENTATHLON_INDOOR,
      CombinedEventType.PENTATHLON_OUTDOOR,
      CombinedEventType.DECATHLON_MASTERS,
      CombinedEventType.HEPTATHLON_MASTERS,
      CombinedEventType.PENTATHLON_INDOOR_MASTERS,
      CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
      CombinedEventType.THROWS_PENTATHLON_MASTERS,
      CombinedEventType.PENTATHLON_U16_MALE,
      CombinedEventType.PENTATHLON_U16_FEMALE,
    ];

    const foundTypes = eventTypes.map((e) => e.type);
    const missingTypes = requiredTypes.filter(
      (type) => !foundTypes.includes(type),
    );

    if (missingTypes.length === 0) {
      console.log('✅ Wszystkie wymagane typy wielobojów są zaimplementowane!');
    } else {
      console.log(`❌ Brakuje typów: ${missingTypes.join(', ')}`);
    }

    return eventTypes;
  }

  /**
   * Test dyscyplin dla każdego typu wieloboju
   */
  testDisciplinesForAllEvents() {
    console.log('\n🎯 === TEST DYSCYPLIN WIELOBOJÓW ===\n');

    const testCases = [
      // Oficjalne World Athletics
      {
        type: CombinedEventType.DECATHLON,
        gender: 'MALE' as const,
        expectedCount: 10,
        name: 'Dziesięciobój',
      },
      {
        type: CombinedEventType.HEPTATHLON,
        gender: 'FEMALE' as const,
        expectedCount: 7,
        name: 'Siedmiobój',
      },
      {
        type: CombinedEventType.PENTATHLON_INDOOR,
        gender: 'FEMALE' as const,
        expectedCount: 5,
        name: 'Pięciobój Indoor',
      },
      {
        type: CombinedEventType.PENTATHLON_OUTDOOR,
        gender: 'FEMALE' as const,
        expectedCount: 5,
        name: 'Pięciobój Outdoor',
      },

      // Masters (WMA)
      {
        type: CombinedEventType.DECATHLON_MASTERS,
        gender: 'MALE' as const,
        expectedCount: 10,
        name: 'Dziesięciobój Masters',
      },
      {
        type: CombinedEventType.HEPTATHLON_MASTERS,
        gender: 'FEMALE' as const,
        expectedCount: 7,
        name: 'Siedmiobój Masters',
      },
      {
        type: CombinedEventType.PENTATHLON_INDOOR_MASTERS,
        gender: 'FEMALE' as const,
        expectedCount: 5,
        name: 'Pięciobój Indoor Masters',
      },
      {
        type: CombinedEventType.THROWS_PENTATHLON_MASTERS,
        gender: 'MALE' as const,
        expectedCount: 5,
        name: 'Pięciobój Rzutowy Masters (M)',
      },
      {
        type: CombinedEventType.THROWS_PENTATHLON_MASTERS,
        gender: 'FEMALE' as const,
        expectedCount: 5,
        name: 'Pięciobój Rzutowy Masters (K)',
      },

      // Specjalny przypadek - różne dyscypliny dla płci
      {
        type: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        gender: 'MALE' as const,
        expectedCount: 5,
        name: 'Pięciobój Outdoor Masters (M)',
      },
      {
        type: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        gender: 'FEMALE' as const,
        expectedCount: 5,
        name: 'Pięciobój Outdoor Masters (K)',
      },

      // Niestandardowe
      {
        type: CombinedEventType.PENTATHLON_U16_MALE,
        gender: 'MALE' as const,
        expectedCount: 5,
        name: 'Pięciobój U16 Chłopcy',
      },
      {
        type: CombinedEventType.PENTATHLON_U16_FEMALE,
        gender: 'FEMALE' as const,
        expectedCount: 5,
        name: 'Pięciobój U16 Dziewczęta',
      },
    ];

    let allTestsPassed = true;

    testCases.forEach((testCase) => {
      try {
        const disciplines = this.service.getDisciplinesForEvent(
          testCase.type,
          testCase.gender,
        );
        const actualCount = disciplines.length;
        const passed = actualCount === testCase.expectedCount;

        if (!passed) allTestsPassed = false;

        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testCase.name} (${testCase.gender}):`);
        console.log(
          `   Oczekiwano: ${testCase.expectedCount} dyscyplin, otrzymano: ${actualCount}`,
        );
        console.log(`   Dyscypliny: ${disciplines.join(', ')}\n`);

        // Specjalne sprawdzenie dla Pięcioboju Rzutowego Masters
        if (testCase.type === CombinedEventType.THROWS_PENTATHLON_MASTERS) {
          const throwEvents = [
            CombinedEventDiscipline.HAMMER_THROW,
            CombinedEventDiscipline.SHOT_PUT,
            CombinedEventDiscipline.DISCUS_THROW,
            CombinedEventDiscipline.JAVELIN_THROW,
            CombinedEventDiscipline.WEIGHT_THROW,
          ];
          const hasAllThrows = throwEvents.every((event) =>
            disciplines.includes(event),
          );
          if (hasAllThrows) {
            console.log('   ✅ Wszystkie konkurencje rzutowe obecne');
          } else {
            console.log('   ❌ Brakuje niektórych konkurencji rzutowych');
            allTestsPassed = false;
          }
        }

        // Sprawdzenie różnic między płciami dla Pięcioboju Outdoor Masters
        if (testCase.type === CombinedEventType.PENTATHLON_OUTDOOR_MASTERS) {
          if (testCase.gender === 'MALE') {
            const expectedMale = [
              CombinedEventDiscipline.LONG_JUMP,
              CombinedEventDiscipline.JAVELIN_THROW,
              CombinedEventDiscipline.SPRINT_200M,
              CombinedEventDiscipline.DISCUS_THROW,
              CombinedEventDiscipline.MIDDLE_1500M,
            ];
            const hasCorrectMale = expectedMale.every((event) =>
              disciplines.includes(event),
            );
            if (hasCorrectMale) {
              console.log('   ✅ Poprawne dyscypliny dla mężczyzn Masters');
            } else {
              console.log('   ❌ Niepoprawne dyscypliny dla mężczyzn Masters');
              allTestsPassed = false;
            }
          } else {
            const expectedFemale = [
              CombinedEventDiscipline.SPRINT_100M_HURDLES,
              CombinedEventDiscipline.HIGH_JUMP,
              CombinedEventDiscipline.SHOT_PUT,
              CombinedEventDiscipline.LONG_JUMP,
              CombinedEventDiscipline.MIDDLE_800M,
            ];
            const hasCorrectFemale = expectedFemale.every((event) =>
              disciplines.includes(event),
            );
            if (hasCorrectFemale) {
              console.log('   ✅ Poprawne dyscypliny dla kobiet Masters');
            } else {
              console.log('   ❌ Niepoprawne dyscypliny dla kobiet Masters');
              allTestsPassed = false;
            }
          }
        }
      } catch (error) {
        console.log(`❌ ${testCase.name}: BŁĄD - ${error.message}\n`);
        allTestsPassed = false;
      }
    });

    if (allTestsPassed) {
      console.log('✅ Wszystkie testy dyscyplin przeszły pomyślnie!');
    } else {
      console.log('❌ Niektóre testy dyscyplin nie przeszły!');
    }

    return allTestsPassed;
  }

  /**
   * Test obliczania punktów
   */
  testScoring() {
    console.log('\n🔢 === TEST OBLICZANIA PUNKTÓW ===\n');

    const scoringTests = [
      // Biegi
      {
        discipline: CombinedEventDiscipline.SPRINT_100M,
        performance: '10.85',
        gender: 'MALE' as const,
        description: '100m męski',
        expectedRange: [800, 900],
      },
      {
        discipline: CombinedEventDiscipline.SPRINT_100M_HURDLES,
        performance: '13.15',
        gender: 'FEMALE' as const,
        description: '100m przez płotki żeński',
        expectedRange: [1000, 1200],
      },
      {
        discipline: CombinedEventDiscipline.SPRINT_200M,
        performance: '23.85',
        gender: 'MALE' as const,
        description: '200m',
        expectedRange: [800, 1000],
      },
      {
        discipline: CombinedEventDiscipline.MIDDLE_800M,
        performance: '2:08.50',
        gender: 'FEMALE' as const,
        description: '800m',
        expectedRange: [900, 1100],
      },
      {
        discipline: CombinedEventDiscipline.MIDDLE_1500M,
        performance: '4:25.30',
        gender: 'MALE' as const,
        description: '1500m',
        expectedRange: [700, 900],
      },

      // Skoki
      {
        discipline: CombinedEventDiscipline.HIGH_JUMP,
        performance: '2.05',
        gender: 'MALE' as const,
        description: 'Skok wzwyż',
        expectedRange: [800, 900],
      },
      {
        discipline: CombinedEventDiscipline.LONG_JUMP,
        performance: '7.45',
        gender: 'MALE' as const,
        description: 'Skok w dal',
        expectedRange: [850, 950],
      },
      {
        discipline: CombinedEventDiscipline.POLE_VAULT,
        performance: '4.80',
        gender: 'MALE' as const,
        description: 'Skok o tyczce',
        expectedRange: [800, 900],
      },

      // Rzuty standardowe
      {
        discipline: CombinedEventDiscipline.SHOT_PUT,
        performance: '15.20',
        gender: 'MALE' as const,
        description: 'Pchnięcie kulą męskie',
        expectedRange: [750, 850],
      },
      {
        discipline: CombinedEventDiscipline.SHOT_PUT,
        performance: '14.50',
        gender: 'FEMALE' as const,
        description: 'Pchnięcie kulą żeńskie',
        expectedRange: [800, 900],
      },
      {
        discipline: CombinedEventDiscipline.DISCUS_THROW,
        performance: '45.80',
        gender: 'MALE' as const,
        description: 'Rzut dyskiem',
        expectedRange: [750, 850],
      },
      {
        discipline: CombinedEventDiscipline.JAVELIN_THROW,
        performance: '62.50',
        gender: 'MALE' as const,
        description: 'Rzut oszczepem męski',
        expectedRange: [750, 850],
      },
      {
        discipline: CombinedEventDiscipline.JAVELIN_THROW,
        performance: '48.20',
        gender: 'FEMALE' as const,
        description: 'Rzut oszczepem żeński',
        expectedRange: [800, 900],
      },

      // Nowe rzuty Masters
      {
        discipline: CombinedEventDiscipline.HAMMER_THROW,
        performance: '45.20',
        gender: 'MALE' as const,
        description: 'Rzut młotem',
        expectedRange: [700, 800],
      },
      {
        discipline: CombinedEventDiscipline.WEIGHT_THROW,
        performance: '15.80',
        gender: 'MALE' as const,
        description: 'Rzut wagą',
        expectedRange: [700, 800],
      },

      // Dyscypliny U16
      {
        discipline: CombinedEventDiscipline.SPRINT_80M_HURDLES,
        performance: '12.85',
        gender: 'FEMALE' as const,
        description: '80m przez płotki U16',
        expectedRange: [700, 900],
      },
      {
        discipline: CombinedEventDiscipline.MIDDLE_600M,
        performance: '1:38.50',
        gender: 'FEMALE' as const,
        description: '600m U16',
        expectedRange: [700, 900],
      },
      {
        discipline: CombinedEventDiscipline.MIDDLE_1000M,
        performance: '2:58.30',
        gender: 'MALE' as const,
        description: '1000m U16',
        expectedRange: [600, 800],
      },
    ];

    let allTestsPassed = true;

    scoringTests.forEach((test) => {
      try {
        const points = this.service.calculatePoints(
          test.discipline,
          test.performance,
          test.gender,
        );
        const inRange =
          points >= test.expectedRange[0] && points <= test.expectedRange[1];

        if (!inRange) allTestsPassed = false;

        const status = inRange ? '✅' : '❌';
        console.log(
          `${status} ${test.description}: ${test.performance} = ${points} pkt (oczekiwano: ${test.expectedRange[0]}-${test.expectedRange[1]})`,
        );
      } catch (error) {
        console.log(`❌ ${test.description}: BŁĄD - ${error.message}`);
        allTestsPassed = false;
      }
    });

    if (allTestsPassed) {
      console.log('\n✅ Wszystkie testy punktacji przeszły pomyślnie!');
    } else {
      console.log('\n❌ Niektóre testy punktacji nie przeszły!');
    }

    return allTestsPassed;
  }

  /**
   * Test walidacji wyników
   */
  testValidation() {
    console.log('\n✅ === TEST WALIDACJI WYNIKÓW ===\n');

    const validationTests = [
      // Poprawne wyniki
      {
        discipline: CombinedEventDiscipline.SPRINT_100M,
        performance: '10.85',
        expected: true,
        description: 'Poprawny czas 100m',
      },
      {
        discipline: CombinedEventDiscipline.HIGH_JUMP,
        performance: '2.05',
        expected: true,
        description: 'Poprawna wysokość skoku',
      },
      {
        discipline: CombinedEventDiscipline.SHOT_PUT,
        performance: '15.20',
        expected: true,
        description: 'Poprawny rzut kulą',
      },
      {
        discipline: CombinedEventDiscipline.HAMMER_THROW,
        performance: '45.20',
        expected: true,
        description: 'Poprawny rzut młotem',
      },
      {
        discipline: CombinedEventDiscipline.WEIGHT_THROW,
        performance: '15.80',
        expected: true,
        description: 'Poprawny rzut wagą',
      },
      {
        discipline: CombinedEventDiscipline.SPRINT_80M_HURDLES,
        performance: '12.85',
        expected: true,
        description: 'Poprawny czas 80m płotki U16',
      },
      {
        discipline: CombinedEventDiscipline.MIDDLE_600M,
        performance: '1:38.50',
        expected: true,
        description: 'Poprawny czas 600m U16',
      },

      // Niepoprawne wyniki
      {
        discipline: CombinedEventDiscipline.SPRINT_100M,
        performance: '8.50',
        expected: false,
        description: 'Za szybki czas 100m',
      },
      {
        discipline: CombinedEventDiscipline.SPRINT_100M,
        performance: '16.00',
        expected: false,
        description: 'Za wolny czas 100m',
      },
      {
        discipline: CombinedEventDiscipline.HIGH_JUMP,
        performance: '0.50',
        expected: false,
        description: 'Za niska wysokość skoku',
      },
      {
        discipline: CombinedEventDiscipline.HIGH_JUMP,
        performance: '3.50',
        expected: false,
        description: 'Za wysoka wysokość skoku',
      },
      {
        discipline: CombinedEventDiscipline.SHOT_PUT,
        performance: '3.00',
        expected: false,
        description: 'Za krótki rzut kulą',
      },
      {
        discipline: CombinedEventDiscipline.SHOT_PUT,
        performance: '30.00',
        expected: false,
        description: 'Za daleki rzut kulą',
      },
    ];

    let allTestsPassed = true;

    validationTests.forEach((test) => {
      const isValid = this.service.validatePerformance(
        test.discipline,
        test.performance,
      );
      const passed = isValid === test.expected;

      if (!passed) allTestsPassed = false;

      const status = passed ? '✅' : '❌';
      const validityText = isValid ? 'POPRAWNY' : 'NIEPOPRAWNY';
      console.log(
        `${status} ${test.description}: ${test.performance} - ${validityText}`,
      );
    });

    if (allTestsPassed) {
      console.log('\n✅ Wszystkie testy walidacji przeszły pomyślnie!');
    } else {
      console.log('\n❌ Niektóre testy walidacji nie przeszły!');
    }

    return allTestsPassed;
  }

  /**
   * Test tworzenia wielobojów
   */
  async testEventCreation() {
    console.log('\n🏗️ === TEST TWORZENIA WIELOBOJÓW ===\n');

    const creationTests = [
      {
        eventType: CombinedEventType.DECATHLON_MASTERS,
        athleteId: 'athlete-masters-001',
        competitionId: 'comp-masters-2024',
        gender: 'MALE' as const,
        description: 'Dziesięciobój Masters',
      },
      {
        eventType: CombinedEventType.THROWS_PENTATHLON_MASTERS,
        athleteId: 'athlete-throws-male-001',
        competitionId: 'comp-masters-2024',
        gender: 'MALE' as const,
        description: 'Pięciobój Rzutowy Masters (M)',
      },
      {
        eventType: CombinedEventType.THROWS_PENTATHLON_MASTERS,
        athleteId: 'athlete-throws-female-001',
        competitionId: 'comp-masters-2024',
        gender: 'FEMALE' as const,
        description: 'Pięciobój Rzutowy Masters (K)',
      },
      {
        eventType: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        athleteId: 'athlete-outdoor-male-001',
        competitionId: 'comp-masters-2024',
        gender: 'MALE' as const,
        description: 'Pięciobój Outdoor Masters (M)',
      },
      {
        eventType: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        athleteId: 'athlete-outdoor-female-001',
        competitionId: 'comp-masters-2024',
        gender: 'FEMALE' as const,
        description: 'Pięciobój Outdoor Masters (K)',
      },
    ];

    let allTestsPassed = true;

    for (const test of creationTests) {
      try {
        console.log(`🔨 Testowanie: ${test.description}`);

        const combinedEvent = await this.service.createCombinedEvent(test);
        const disciplines = this.service.getDisciplinesForEvent(
          test.eventType,
          test.gender,
        );

        console.log(`   ✅ Utworzono wielobój ID: ${combinedEvent.id}`);
        console.log(
          `   📋 Dyscypliny (${disciplines.length}): ${disciplines.join(', ')}`,
        );
        console.log('');
      } catch (error) {
        console.log(`   ❌ Błąd: ${error.message}\n`);
        allTestsPassed = false;
      }
    }

    if (allTestsPassed) {
      console.log(
        '✅ Wszystkie testy tworzenia wielobojów przeszły pomyślnie!',
      );
    } else {
      console.log('❌ Niektóre testy tworzenia wielobojów nie przeszły!');
    }

    return allTestsPassed;
  }

  /**
   * Uruchomienie wszystkich testów
   */
  async runAllTests() {
    console.log(
      '🧪 === KOMPLETNY TEST IMPLEMENTACJI OFICJALNYCH WIELOBOJÓW ===',
    );
    console.log('Zgodnie z przepisami World Athletics i WMA\n');

    const results = {
      eventTypes: false,
      disciplines: false,
      scoring: false,
      validation: false,
      creation: false,
    };

    try {
      // Test 1: Dostępne typy wielobojów
      this.testAvailableEventTypes();
      results.eventTypes = true;

      // Test 2: Dyscypliny dla każdego wieloboju
      results.disciplines = this.testDisciplinesForAllEvents();

      // Test 3: Obliczanie punktów
      results.scoring = this.testScoring();

      // Test 4: Walidacja wyników
      results.validation = this.testValidation();

      // Test 5: Tworzenie wielobojów
      results.creation = await this.testEventCreation();
    } catch (error) {
      console.error('❌ Błąd podczas testów:', error);
    }

    // Podsumowanie
    console.log('\n📊 === PODSUMOWANIE TESTÓW ===\n');

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    Object.entries(results).forEach(([testName, passed]) => {
      const status = passed ? '✅' : '❌';
      console.log(
        `${status} ${testName.toUpperCase()}: ${passed ? 'PRZESZEDŁ' : 'NIE PRZESZEDŁ'}`,
      );
    });

    console.log(
      `\n🎯 WYNIK KOŃCOWY: ${passedTests}/${totalTests} testów przeszło pomyślnie`,
    );

    if (passedTests === totalTests) {
      console.log(
        '\n🎉 WSZYSTKIE TESTY PRZESZŁY! Implementacja jest kompletna i zgodna z przepisami.',
      );
      console.log('\n📋 ZAIMPLEMENTOWANE WIELOBOJE:');
      console.log('✅ Wszystkie oficjalne wieloboje World Athletics');
      console.log('✅ Wszystkie wieloboje Masters (WMA) z oznaczeniem');
      console.log('✅ Niestandardowe wieloboje U16 (zachowane)');
      console.log('✅ Poprawne obliczanie punktów według tabel IAAF/WA');
      console.log('✅ Walidacja wyników z realistycznymi zakresami');
      console.log('✅ Różne dyscypliny dla płci w Pięcioboju Outdoor Masters');
      console.log('✅ Specjalny Pięciobój Rzutowy Masters (tylko rzuty)');
    } else {
      console.log('\n⚠️ NIEKTÓRE TESTY NIE PRZESZŁY. Sprawdź implementację.');
    }

    return passedTests === totalTests;
  }
}

// Funkcja do uruchomienia testów
export async function runImplementationTest() {
  const test = new CombinedEventsImplementationTest();
  return await test.runAllTests();
}

// Uruchomienie testów jeśli plik jest wykonywany bezpośrednio
if (require.main === module) {
  runImplementationTest().catch(console.error);
}
