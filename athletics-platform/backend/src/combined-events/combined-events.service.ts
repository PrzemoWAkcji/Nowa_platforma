import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import {
  CombinedEventType,
  CombinedEventDiscipline,
  COMBINED_EVENT_DISCIPLINES,
} from './types/combined-events.types';
import {
  getScoringCoefficients,
  parseTimeToSeconds,
  parseDistanceToMeters,
  parseHeightToMeters,
  isTrackEvent,
} from './constants/scoring-tables';
import { CreateCombinedEventDto } from './dto/create-combined-event.dto';
import { UpdateCombinedEventResultDto } from './dto/update-combined-event-result.dto';

@Injectable()
export class CombinedEventsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Oblicza punkty dla pojedynczej dyscypliny wieloboju
   */
  calculatePoints(
    discipline: string,
    performance: string,
    gender: 'MALE' | 'FEMALE' = 'MALE',
  ): number {
    const coefficients = getScoringCoefficients(discipline, gender);

    if (coefficients.A === 0) {
      throw new Error(`Nieznana dyscyplina: ${discipline}`);
    }

    let performanceValue: number;
    let points: number;

    if (isTrackEvent(discipline)) {
      // Dla biegów: Points = A * (B - T)^C
      performanceValue = parseTimeToSeconds(performance);
      const timeDiff = coefficients.B - performanceValue;

      if (timeDiff <= 0) {
        return 0; // Wynik zbyt słaby
      }

      points = coefficients.A * Math.pow(timeDiff, coefficients.C);
    } else {
      // Dla skoków i rzutów: Points = A * (M - B)^C
      if (discipline === 'HJ' || discipline === 'PV') {
        performanceValue = parseHeightToMeters(performance) * 100; // Konwersja na cm
      } else if (discipline === 'LJ') {
        performanceValue = parseDistanceToMeters(performance) * 100; // Skok w dal też w cm
      } else {
        performanceValue = parseDistanceToMeters(performance); // Rzuty w metrach
      }

      const performanceDiff = performanceValue - coefficients.B;

      if (performanceDiff <= 0) {
        return 0; // Wynik zbyt słaby
      }

      points = coefficients.A * Math.pow(performanceDiff, coefficients.C);
    }

    return Math.round(points);
  }

  /**
   * Pobiera dostępne typy wielobojów z opisami
   */
  getAvailableEventTypes() {
    return [
      // Oficjalne wieloboje World Athletics
      {
        type: CombinedEventType.DECATHLON,
        name: 'Dziesięciobój',
        description: 'Oficjalny 10-bój męski (World Athletics)',
        gender: 'MALE',
        disciplines: 10,
        official: true,
        category: 'World Athletics',
      },
      {
        type: CombinedEventType.HEPTATHLON,
        name: 'Siedmiobój',
        description: 'Oficjalny 7-bój żeński (World Athletics)',
        gender: 'FEMALE',
        disciplines: 7,
        official: true,
        category: 'World Athletics',
      },
      {
        type: CombinedEventType.PENTATHLON_INDOOR,
        name: 'Pięciobój Indoor',
        description: 'Oficjalny 5-bój halowy (World Athletics)',
        gender: 'BOTH',
        disciplines: 5,
        official: true,
        category: 'World Athletics',
      },
      {
        type: CombinedEventType.PENTATHLON_OUTDOOR,
        name: 'Pięciobój Outdoor',
        description: 'Oficjalny 5-bój zewnętrzny (World Athletics)',
        gender: 'BOTH',
        disciplines: 5,
        official: true,
        category: 'World Athletics',
      },

      // Wieloboje Masters (WMA)
      {
        type: CombinedEventType.DECATHLON_MASTERS,
        name: 'Dziesięciobój Masters',
        description: 'Dziesięciobój dla kategorii Masters 35+ (WMA)',
        gender: 'MALE',
        disciplines: 10,
        official: true,
        category: 'Masters (WMA)',
      },
      {
        type: CombinedEventType.HEPTATHLON_MASTERS,
        name: 'Siedmiobój Masters',
        description: 'Siedmiobój dla kategorii Masters 35+ (WMA)',
        gender: 'FEMALE',
        disciplines: 7,
        official: true,
        category: 'Masters (WMA)',
      },
      {
        type: CombinedEventType.PENTATHLON_INDOOR_MASTERS,
        name: 'Pięciobój Indoor Masters',
        description: 'Pięciobój halowy dla kategorii Masters 35+ (WMA)',
        gender: 'BOTH',
        disciplines: 5,
        official: true,
        category: 'Masters (WMA)',
      },
      {
        type: CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
        name: 'Pięciobój Outdoor Masters',
        description: 'Pięciobój zewnętrzny dla kategorii Masters 35+ (WMA)',
        gender: 'BOTH',
        disciplines: 5,
        official: true,
        category: 'Masters (WMA)',
      },
      {
        type: CombinedEventType.THROWS_PENTATHLON_MASTERS,
        name: 'Pięciobój Rzutowy Masters',
        description: 'Pięciobój rzutowy dla kategorii Masters 35+ (WMA)',
        gender: 'BOTH',
        disciplines: 5,
        official: true,
        category: 'Masters (WMA)',
      },

      // Niestandardowe wieloboje
      {
        type: CombinedEventType.PENTATHLON_U16_MALE,
        name: 'Pięciobój U16 Chłopcy',
        description: 'Niestandardowy pięciobój dla chłopców U16',
        gender: 'MALE',
        disciplines: 5,
        official: false,
        category: 'Niestandardowe',
      },
      {
        type: CombinedEventType.PENTATHLON_U16_FEMALE,
        name: 'Pięciobój U16 Dziewczęta',
        description: 'Niestandardowy pięciobój dla dziewcząt U16',
        gender: 'FEMALE',
        disciplines: 5,
        official: false,
        category: 'Niestandardowe',
      },
    ];
  }

  /**
   * Pobiera dyscypliny dla konkretnego wieloboju z uwzględnieniem płci
   */
  getDisciplinesForEvent(
    eventType: CombinedEventType,
    gender: 'MALE' | 'FEMALE',
  ): CombinedEventDiscipline[] {
    // Specjalne przypadki dla wielobojów zależnych od płci
    if (eventType === CombinedEventType.PENTATHLON_OUTDOOR_MASTERS) {
      if (gender === 'MALE') {
        // Mężczyźni: skok w dal, rzut oszczepem, 200m, rzut dyskiem, 1500m
        return [
          CombinedEventDiscipline.LONG_JUMP,
          CombinedEventDiscipline.JAVELIN_THROW,
          CombinedEventDiscipline.SPRINT_200M,
          CombinedEventDiscipline.DISCUS_THROW,
          CombinedEventDiscipline.MIDDLE_1500M,
        ];
      } else {
        // Kobiety: płotki krótkie, skok wzwyż, pchnięcie kulą, skok w dal, 800m
        return [
          CombinedEventDiscipline.SPRINT_100M_HURDLES,
          CombinedEventDiscipline.HIGH_JUMP,
          CombinedEventDiscipline.SHOT_PUT,
          CombinedEventDiscipline.LONG_JUMP,
          CombinedEventDiscipline.MIDDLE_800M,
        ];
      }
    }

    // Dla pozostałych wielobojów używamy standardowych definicji
    return COMBINED_EVENT_DISCIPLINES[eventType] || [];
  }

  /**
   * Tworzy nowy wielobój
   */
  async createCombinedEvent(createDto: CreateCombinedEventDto) {
    const disciplines = this.getDisciplinesForEvent(
      createDto.eventType,
      createDto.gender,
    );

    if (!disciplines || disciplines.length === 0) {
      throw new Error(`Nieznany typ wieloboju: ${createDto.eventType}`);
    }

    // Tworzymy rekord wieloboju
    const combinedEvent = await this.prisma.combinedEvent.create({
      data: {
        eventType: createDto.eventType,
        athleteId: createDto.athleteId,
        competitionId: createDto.competitionId,
        gender: createDto.gender,
        totalPoints: 0,
        isComplete: false,
      },
    });

    // Tworzymy rekordy dla każdej dyscypliny
    const disciplineResults = await Promise.all(
      disciplines.map((discipline, index) =>
        this.prisma.combinedEventResult.create({
          data: {
            combinedEventId: combinedEvent.id,
            discipline: discipline,
            dayOrder: index + 1,
            performance: null,
            points: 0,
            isValid: false,
          },
        }),
      ),
    );

    return {
      ...combinedEvent,
      results: disciplineResults,
    };
  }

  /**
   * Aktualizuje wynik w konkretnej dyscyplinie
   */
  async updateEventResult(
    combinedEventId: string,
    discipline: string,
    updateDto: UpdateCombinedEventResultDto,
  ) {
    // Use transaction to prevent race conditions
    return await this.prisma.$transaction(async (prisma) => {
      // Pobieramy wielobój
      const combinedEvent = await prisma.combinedEvent.findUnique({
        where: { id: combinedEventId },
        include: { results: true },
      });

      if (!combinedEvent) {
        throw new Error('Wielobój nie został znaleziony');
      }

      // Validate that the discipline exists for this combined event
      const validDisciplines = this.getDisciplinesForEvent(
        combinedEvent.eventType as CombinedEventType,
        combinedEvent.gender as 'MALE' | 'FEMALE',
      );
      
      const disciplineExists = validDisciplines.some(d => d === discipline);
      if (!disciplineExists) {
        throw new Error(`Dyscyplina ${discipline} nie jest częścią wieloboju ${combinedEvent.eventType}`);
      }

      // Obliczamy punkty
      const points = this.calculatePoints(
        discipline,
        updateDto.performance,
        combinedEvent.gender as 'MALE' | 'FEMALE',
      );

      // Aktualizujemy wynik dyscypliny
      const updatedResult = await prisma.combinedEventResult.update({
        where: {
          combinedEventId_discipline: {
            combinedEventId,
            discipline,
          },
        },
        data: {
          performance: updateDto.performance,
          points,
          wind: updateDto.wind,
          isValid: true,
          updatedAt: new Date(),
        },
      });

      // Przeliczamy całkowitą liczbę punktów w tej samej transakcji
      const results = await prisma.combinedEventResult.findMany({
        where: { combinedEventId },
      });

      const totalPoints = results
        .filter((result) => result.isValid)
        .reduce((sum, result) => sum + result.points, 0);

      const validResultsCount = results.filter((result) => result.isValid).length;
      const expectedResultsCount = results.length;
      const isComplete = validResultsCount === expectedResultsCount;

      await prisma.combinedEvent.update({
        where: { id: combinedEventId },
        data: {
          totalPoints,
          isComplete,
          updatedAt: new Date(),
        },
      });

      // Invalidate cache after updating results
      const eventForCache = await prisma.combinedEvent.findUnique({
        where: { id: combinedEventId },
        select: { competitionId: true, eventType: true },
      });
      
      if (eventForCache) {
        const cacheKey = `ranking:${eventForCache.competitionId}:${eventForCache.eventType}`;
        await this.cacheManager.del(cacheKey);
      }

      return updatedResult;
    });
  }

  /**
   * Przelicza całkowitą liczbę punktów wieloboju
   */
  async recalculateTotalPoints(combinedEventId: string) {
    const results = await this.prisma.combinedEventResult.findMany({
      where: { combinedEventId },
    });

    const totalPoints = results
      .filter((result) => result.isValid)
      .reduce((sum, result) => sum + result.points, 0);

    const validResultsCount = results.filter((result) => result.isValid).length;
    const expectedResultsCount = results.length;
    const isComplete = validResultsCount === expectedResultsCount;

    return await this.prisma.combinedEvent.update({
      where: { id: combinedEventId },
      data: {
        totalPoints,
        isComplete,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Pobiera szczegóły wieloboju
   */
  async getCombinedEvent(id: string) {
    return await this.prisma.combinedEvent.findUnique({
      where: { id },
      include: {
        results: {
          orderBy: { dayOrder: 'asc' },
        },
        athlete: true,
        competition: true,
      },
    });
  }

  /**
   * Pobiera wszystkie wieloboje dla zawodów
   */
  async getCombinedEventsByCompetition(competitionId: string) {
    return await this.prisma.combinedEvent.findMany({
      where: { competitionId },
      include: {
        results: {
          orderBy: { dayOrder: 'asc' },
        },
        athlete: true,
      },
      orderBy: { totalPoints: 'desc' },
    });
  }

  /**
   * Pobiera wieloboje z paginacją
   */
  async getCombinedEventsPaginated(
    competitionId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      this.prisma.combinedEvent.findMany({
        where: { competitionId },
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              club: true,
            },
          },
        },
        orderBy: { totalPoints: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.combinedEvent.count({
        where: { competitionId },
      }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Pobiera ranking wieloboju
   */
  async getCombinedEventRanking(
    competitionId: string,
    eventType: CombinedEventType,
  ) {
    const cacheKey = `ranking:${competitionId}:${eventType}`;
    
    // Try to get from cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const events = await this.prisma.combinedEvent.findMany({
      where: {
        competitionId,
        eventType,
        isComplete: true,
      },
      include: {
        athlete: true,
        results: {
          orderBy: { dayOrder: 'asc' },
        },
      },
      orderBy: { totalPoints: 'desc' },
    });

    // Dodajemy pozycje
    const ranking = events.map((event, index) => ({
      ...event,
      position: index + 1,
    }));

    // Cache for 2 minutes (rankings change frequently during competitions)
    await this.cacheManager.set(cacheKey, ranking, 120000);
    
    return ranking;
  }

  /**
   * Usuwa wielobój
   */
  async deleteCombinedEvent(id: string) {
    // Najpierw usuwamy wyniki
    await this.prisma.combinedEventResult.deleteMany({
      where: { combinedEventId: id },
    });

    // Następnie usuwamy wielobój
    return await this.prisma.combinedEvent.delete({
      where: { id },
    });
  }

  /**
   * Pobiera statystyki wieloboju
   */
  async getCombinedEventStatistics(competitionId: string) {
    // Only load necessary data for statistics - don't include results and athlete details
    const events = await this.prisma.combinedEvent.findMany({
      where: { competitionId },
      select: {
        id: true,
        eventType: true,
        totalPoints: true,
        isComplete: true,
      },
    });

    const statistics = {
      totalEvents: events.length,
      completedEvents: events.filter((e) => e.isComplete).length,
      averagePoints: 0,
      bestPerformance: null as {
        totalPoints: number;
        eventType: string;
      } | null,
      eventTypeBreakdown: {} as Record<string, number>,
    };

    if (events.length > 0) {
      const completedEvents = events.filter((e) => e.isComplete);

      if (completedEvents.length > 0) {
        statistics.averagePoints = Math.round(
          completedEvents.reduce((sum, e) => sum + e.totalPoints, 0) /
            completedEvents.length,
        );

        statistics.bestPerformance = completedEvents.reduce((best, current) =>
          current.totalPoints > best.totalPoints ? current : best,
        );
      }

      // Breakdown by event type
      events.forEach((event) => {
        statistics.eventTypeBreakdown[event.eventType] =
          (statistics.eventTypeBreakdown[event.eventType] || 0) + 1;
      });
    }

    return statistics;
  }

  /**
   * Waliduje wynik dyscypliny
   */
  validatePerformance(discipline: string, performance: string): boolean {
    try {
      if (isTrackEvent(discipline)) {
        const seconds = parseTimeToSeconds(performance);

        // Realistyczne limity czasowe
        switch (discipline) {
          case '100M':
            return seconds >= 9.0 && seconds <= 15.0;
          case '110MH':
          case '100MH':
            return seconds >= 11.0 && seconds <= 20.0;
          case '80MH':
            return seconds >= 9.5 && seconds <= 16.0; // 80m przez płotki U16
          case '600M':
            return seconds >= 60.0 && seconds <= 180.0; // 600m U16 (1:00 - 3:00)
          case '1000M':
            return seconds >= 120.0 && seconds <= 360.0; // 1000m U16 (2:00 - 6:00)
          case '200M':
            return seconds >= 19.0 && seconds <= 35.0;
          case '400M':
            return seconds >= 40.0 && seconds <= 80.0;
          case '60M':
            return seconds >= 6.0 && seconds <= 10.0;
          case '60MH':
            return seconds >= 7.0 && seconds <= 12.0;
          case '800M':
            return seconds >= 90.0 && seconds <= 300.0; // 1:30 - 5:00
          case '1500M':
            return seconds >= 180.0 && seconds <= 600.0; // 3:00 - 10:00
          default:
            return seconds > 0 && seconds < 3600;
        }
      } else {
        if (discipline === 'HJ') {
          const meters = parseHeightToMeters(performance);
          return meters >= 1.0 && meters <= 3.0; // 1m - 3m
        } else if (discipline === 'PV') {
          const meters = parseHeightToMeters(performance);
          return meters >= 2.0 && meters <= 7.0; // 2m - 7m
        } else if (discipline === 'LJ') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 3.0 && meters <= 12.0; // 3m - 12m
        } else if (discipline === 'SP') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 5.0 && meters <= 25.0; // 5m - 25m
        } else if (discipline === 'SP3') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 4.0 && meters <= 20.0; // 4m - 20m (kula 3kg)
        } else if (discipline === 'SP5') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 5.0 && meters <= 22.0; // 5m - 22m (kula 5kg)
        } else if (discipline === 'DT') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 15.0 && meters <= 80.0; // 15m - 80m
        } else if (discipline === 'JT') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 20.0 && meters <= 100.0; // 20m - 100m
        } else if (discipline === 'HT') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 15.0 && meters <= 90.0; // 15m - 90m
        } else if (discipline === 'WT') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 8.0 && meters <= 30.0; // 8m - 30m
        } else if (discipline === 'TJ') {
          const meters = parseDistanceToMeters(performance);
          return meters >= 8.0 && meters <= 20.0; // 8m - 20m
        } else {
          const meters = parseDistanceToMeters(performance);
          return meters > 0 && meters < 200;
        }
      }
    } catch {
      return false;
    }
  }
}
