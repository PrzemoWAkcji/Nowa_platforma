/**
 * Demo wszystkich oficjalnych wielobojów
 * Pokazuje działanie systemu zgodnie z przepisami World Athletics i WMA
 */

import { CombinedEventsService } from './combined-events.service';
import {
    getAllCustomExamples,
    getAllMastersExamples,
    getAllOfficialExamples,
} from './examples/official-combined-events-examples';
import { CombinedEventType } from './types/combined-events.types';

// Mock PrismaService dla demo
const mockPrismaService = {
  combinedEvent: {
    create: (data: any) =>
      Promise.resolve({
        id: `demo-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    findUnique: (_query: any) => Promise.resolve(null),
    findMany: (_query: any) => Promise.resolve([]),
    update: (query: any) => Promise.resolve({ ...query.data }),
    delete: (query: any) => Promise.resolve({ id: query.where.id }),
  },
  combinedEventResult: {
    create: (data: any) =>
      Promise.resolve({
        id: `result-${Date.now()}-${Math.random()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    findMany: (_query: any) => Promise.resolve([]),
    update: (query: any) => Promise.resolve({ ...query.data }),
    deleteMany: (_query: any) => Promise.resolve({ count: 0 }),
  },
};

class OfficialCombinedEventsDemo {
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
   * Demonstracja wszystkich dostępnych typów wielobojów
   */
  demonstrateAvailableEventTypes() {
    console.log('\n🏆 === DOSTĘPNE TYPY WIELOBOJÓW ===\n');

    const eventTypes = this.service.getAvailableEventTypes();

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
      console.log(`📋 ${category}:`);
      events.forEach((event) => {
        const officialMark = event.official ? '✅' : '⚠️';
        console.log(`  ${officialMark} ${event.name} (${event.type})`);
        console.log(`     ${event.description}`);
        console.log(
          `     Płeć: ${event.gender}, Dyscyplin: ${event.disciplines}\n`,
        );
      });
    });
  }

  /**
   * Demonstracja dyscyplin dla różnych wielobojów
   */
  demonstrateDisciplines() {
    console.log('\n🎯 === DYSCYPLINY WIELOBOJÓW ===\n');

    const testCases = [
      {
        type: CombinedEventType.DECATHLON,
        gender: 'MALE' as const,
        name: 'Dziesięciobój',
      },
      {
        type: CombinedEventType.HEPTATHLON,
        gender: 'FEMALE' as const,
        name: 'Siedmiobój',
      },
      {
        type: CombinedEventType.DECATHLON_MASTERS,
        gender: 'MALE' as const,
        name: 'Dziesięciobój Masters',
      },
      {
        type: CombinedEventType.THROWS_PENTATHLON_MASTERS,
        gender: 'MALE' as const,
        name: 'Pięciobój Rzutowy Masters',
      },
      {
        type: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        gender: 'MALE' as const,
        name: 'Pięciobój Outdoor Masters (M)',
      },
      {
        type: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        gender: 'FEMALE' as const,
        name: 'Pięciobój Outdoor Masters (K)',
      },
      {
        type: CombinedEventType.PENTATHLON_U16_MALE,
        gender: 'MALE' as const,
        name: 'Pięciobój U16 Chłopcy (niestandardowy)',
      },
    ];

    testCases.forEach((testCase) => {
      const disciplines = this.service.getDisciplinesForEvent(
        testCase.type,
        testCase.gender,
      );
      console.log(`🏃 ${testCase.name}:`);
      disciplines.forEach((discipline, index) => {
        console.log(`  ${index + 1}. ${discipline}`);
      });
      console.log('');
    });
  }

  /**
   * Demonstracja obliczania punktów
   */
  demonstrateScoring() {
    console.log('\n🔢 === OBLICZANIE PUNKTÓW ===\n');

    const scoringExamples = [
      {
        discipline: '100M',
        performance: '10.85',
        gender: 'MALE' as const,
        description: '100m męski',
      },
      {
        discipline: '100MH',
        performance: '13.15',
        gender: 'FEMALE' as const,
        description: '100m przez płotki żeński',
      },
      {
        discipline: 'HJ',
        performance: '2.05',
        gender: 'MALE' as const,
        description: 'Skok wzwyż',
      },
      {
        discipline: 'SP',
        performance: '15.20',
        gender: 'MALE' as const,
        description: 'Pchnięcie kulą męskie',
      },
      {
        discipline: 'SP',
        performance: '14.50',
        gender: 'FEMALE' as const,
        description: 'Pchnięcie kulą żeńskie',
      },
      {
        discipline: 'HT',
        performance: '45.20',
        gender: 'MALE' as const,
        description: 'Rzut młotem',
      },
      {
        discipline: 'WT',
        performance: '15.80',
        gender: 'MALE' as const,
        description: 'Rzut wagą',
      },
      {
        discipline: '80MH',
        performance: '12.85',
        gender: 'FEMALE' as const,
        description: '80m przez płotki U16',
      },
      {
        discipline: '600M',
        performance: '1:38.50',
        gender: 'FEMALE' as const,
        description: '600m U16',
      },
    ];

    scoringExamples.forEach((example) => {
      try {
        const points = this.service.calculatePoints(
          example.discipline,
          example.performance,
          example.gender,
        );
        console.log(
          `📊 ${example.description}: ${example.performance} = ${points} punktów`,
        );
      } catch (error) {
        console.log(
          `❌ ${example.description}: Błąd obliczania - ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  }

  /**
   * Demonstracja walidacji wyników
   */
  demonstrateValidation() {
    console.log('\n✅ === WALIDACJA WYNIKÓW ===\n');

    const validationTests = [
      {
        discipline: '100M',
        performance: '10.85',
        expected: true,
        description: 'Poprawny czas 100m',
      },
      {
        discipline: '100M',
        performance: '8.50',
        expected: false,
        description: 'Za szybki czas 100m',
      },
      {
        discipline: 'HJ',
        performance: '2.05',
        expected: true,
        description: 'Poprawna wysokość skoku',
      },
      {
        discipline: 'HJ',
        performance: '3.50',
        expected: false,
        description: 'Za wysoki skok',
      },
      {
        discipline: 'SP',
        performance: '15.20',
        expected: true,
        description: 'Poprawny rzut kulą',
      },
      {
        discipline: 'HT',
        performance: '45.20',
        expected: true,
        description: 'Poprawny rzut młotem',
      },
      {
        discipline: '80MH',
        performance: '12.85',
        expected: true,
        description: 'Poprawny czas 80m płotki U16',
      },
      {
        discipline: '600M',
        performance: '1:38.50',
        expected: true,
        description: 'Poprawny czas 600m U16',
      },
    ];

    validationTests.forEach((test) => {
      const isValid = this.service.validatePerformance(
        test.discipline,
        test.performance,
      );
      const status = isValid === test.expected ? '✅' : '❌';
      console.log(
        `${status} ${test.description}: ${test.performance} - ${isValid ? 'POPRAWNY' : 'NIEPOPRAWNY'}`,
      );
    });
  }

  /**
   * Demonstracja tworzenia wielobojów
   */
  async demonstrateEventCreation() {
    console.log('\n🏗️ === TWORZENIE WIELOBOJÓW ===\n');

    const creationExamples = [
      {
        eventType: CombinedEventType.DECATHLON_MASTERS,
        athleteId: 'athlete-masters-001',
        competitionId: 'comp-masters-2024',
        gender: 'MALE' as const,
        description: 'Dziesięciobój Masters dla mężczyzny 50+',
      },
      {
        eventType: CombinedEventType.THROWS_PENTATHLON_MASTERS,
        athleteId: 'athlete-throws-001',
        competitionId: 'comp-masters-2024',
        gender: 'FEMALE' as const,
        description: 'Pięciobój Rzutowy Masters dla kobiety 45+',
      },
      {
        eventType: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        athleteId: 'athlete-outdoor-male-001',
        competitionId: 'comp-masters-2024',
        gender: 'MALE' as const,
        description:
          'Pięciobój Outdoor Masters dla mężczyzny (inne dyscypliny niż kobiety)',
      },
      {
        eventType: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        athleteId: 'athlete-outdoor-female-001',
        competitionId: 'comp-masters-2024',
        gender: 'FEMALE' as const,
        description:
          'Pięciobój Outdoor Masters dla kobiety (inne dyscypliny niż mężczyźni)',
      },
    ];

    for (const example of creationExamples) {
      try {
        console.log(`🔨 Tworzenie: ${example.description}`);

        const combinedEvent = await this.service.createCombinedEvent(example);
        const disciplines = this.service.getDisciplinesForEvent(
          example.eventType,
          example.gender,
        );

        console.log(`   ✅ Utworzono wielobój ID: ${combinedEvent.id}`);
        console.log(
          `   📋 Dyscypliny (${disciplines.length}): ${disciplines.join(', ')}`,
        );
        console.log('');
      } catch (error) {
        console.log(`   ❌ Błąd: ${error.message}\n`);
      }
    }
  }

  /**
   * Demonstracja przykładów z realnymi wynikami
   */
  demonstrateRealExamples() {
    console.log('\n📊 === PRZYKŁADY Z REALNYMI WYNIKAMI ===\n');

    // Oficjalne wieloboje World Athletics
    console.log('🏆 OFICJALNE WIELOBOJE WORLD ATHLETICS:');
    const officialExamples = getAllOfficialExamples();
    officialExamples.forEach((example) => {
      console.log(`\n📋 ${example.eventType} (${example.gender}):`);
      console.log(`   Zawodnik: ${example.athleteId}`);
      console.log(`   Oczekiwane punkty: ${example.expectedTotalPoints}`);
      console.log(`   Przykładowe wyniki:`);
      example.sampleResults.slice(0, 3).forEach((result) => {
        console.log(
          `     ${result.discipline}: ${result.performance} (${result.expectedPoints} pkt)`,
        );
      });
    });

    // Wieloboje Masters
    console.log('\n\n🥇 WIELOBOJE MASTERS (WMA):');
    const mastersExamples = getAllMastersExamples();
    mastersExamples.forEach((example) => {
      console.log(
        `\n📋 ${example.eventType} (${example.gender}, ${example.ageGroup}):`,
      );
      console.log(`   Zawodnik: ${example.athleteId}`);
      console.log(`   Oczekiwane punkty: ${example.expectedTotalPoints}`);
      if ('note' in example && example.note) {
        console.log(`   Uwaga: ${example.note}`);
      }
      console.log(`   Przykładowe wyniki:`);
      example.sampleResults.slice(0, 3).forEach((result) => {
        const note = result.note ? ` (${result.note})` : '';
        console.log(
          `     ${result.discipline}: ${result.performance} (${result.expectedPoints} pkt)${note}`,
        );
      });
    });

    // Niestandardowe wieloboje
    console.log('\n\n🔧 NIESTANDARDOWE WIELOBOJE:');
    const customExamples = getAllCustomExamples();
    customExamples.forEach((example) => {
      console.log(
        `\n📋 ${example.eventType} (${example.gender}, ${example.ageGroup}):`,
      );
      console.log(`   Zawodnik: ${example.athleteId}`);
      console.log(`   Oczekiwane punkty: ${example.expectedTotalPoints}`);
      if ('note' in example && example.note) {
        console.log(`   Uwaga: ${example.note}`);
      }
      console.log(`   Przykładowe wyniki:`);
      example.sampleResults.forEach((result) => {
        const note = 'note' in result && result.note ? ` (${result.note})` : '';
        console.log(
          `     ${result.discipline}: ${result.performance} (${result.expectedPoints} pkt)${note}`,
        );
      });
    });
  }

  /**
   * Uruchomienie pełnej demonstracji
   */
  async runFullDemo() {
    console.log('🎯 === DEMO OFICJALNYCH WIELOBOJÓW ===');
    console.log('Zgodnie z przepisami World Athletics i WMA\n');

    this.demonstrateAvailableEventTypes();
    this.demonstrateDisciplines();
    this.demonstrateScoring();
    this.demonstrateValidation();
    await this.demonstrateEventCreation();
    this.demonstrateRealExamples();

    console.log('\n✅ === DEMO ZAKOŃCZONE ===');
    console.log(
      'System obsługuje wszystkie oficjalne wieloboje zgodnie z przepisami!',
    );
  }
}

// Funkcja do uruchomienia demo
export async function runOfficialCombinedEventsDemo() {
  const demo = new OfficialCombinedEventsDemo();
  await demo.runFullDemo();
}

// Uruchomienie demo jeśli plik jest wykonywany bezpośrednio
if (require.main === module) {
  runOfficialCombinedEventsDemo().catch(console.error);
}
