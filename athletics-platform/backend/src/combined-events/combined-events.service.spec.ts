import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CombinedEventsService } from './combined-events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CombinedEventType } from './types/combined-events.types';

describe('CombinedEventsService', () => {
  let service: CombinedEventsService;

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
    $transaction: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CombinedEventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CombinedEventsService>(CombinedEventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePoints', () => {
    it('should calculate points for 100m sprint correctly', () => {
      const points = service.calculatePoints('100M', '10.50', 'MALE');
      expect(points).toBeGreaterThan(0);
      expect(typeof points).toBe('number');
    });

    it('should calculate points for long jump correctly', () => {
      const points = service.calculatePoints('LJ', '7.45', 'MALE');
      expect(points).toBeGreaterThan(0);
      expect(typeof points).toBe('number');
    });

    it('should calculate points for high jump correctly', () => {
      const points = service.calculatePoints('HJ', '2.15', 'MALE');
      expect(points).toBeGreaterThan(0);
      expect(typeof points).toBe('number');
    });

    it('should calculate points for shot put correctly', () => {
      const points = service.calculatePoints('SP', '15.50', 'MALE');
      expect(points).toBeGreaterThan(0);
      expect(typeof points).toBe('number');
    });

    it('should calculate points for 1500m correctly', () => {
      const points = service.calculatePoints('1500M', '4:15.30', 'MALE');
      expect(points).toBeGreaterThan(0);
      expect(typeof points).toBe('number');
    });

    it('should return 0 for very poor performance', () => {
      const points = service.calculatePoints('100M', '20.00', 'MALE');
      expect(points).toBe(0);
    });

    it('should throw error for unknown discipline', () => {
      expect(() => {
        service.calculatePoints('UNKNOWN', '10.50', 'MALE');
      }).toThrow('Nieznana dyscyplina: UNKNOWN');
    });

    it('should calculate different points for male vs female', () => {
      const malePoints = service.calculatePoints('100M', '11.00', 'MALE');
      const femalePoints = service.calculatePoints('100M', '11.00', 'FEMALE');
      expect(malePoints).not.toBe(femalePoints);
    });

    it('should calculate points for 80m hurdles correctly', () => {
      const points = service.calculatePoints('80MH', '11.50', 'FEMALE');

      expect(points).toBeGreaterThan(0);
      expect(points).toBeLessThan(1200); // Realistyczny zakres dla U16
      expect(typeof points).toBe('number');
    });

    it('should calculate points for 600m correctly', () => {
      const points = service.calculatePoints('600M', '1:35.00', 'FEMALE');

      expect(points).toBeGreaterThan(0);
      expect(points).toBeLessThan(1200);
      expect(typeof points).toBe('number');
    });

    it('should calculate points for 1000m correctly', () => {
      const points = service.calculatePoints('1000M', '2:50.00', 'MALE');

      expect(points).toBeGreaterThan(0);
      expect(points).toBeLessThan(1200);
      expect(typeof points).toBe('number');
    });

    it('should calculate points for shot put 3kg correctly', () => {
      const points = service.calculatePoints('SP3', '11.50', 'FEMALE');

      expect(points).toBeGreaterThan(0);
      expect(points).toBeLessThan(1200);
      expect(typeof points).toBe('number');
    });

    it('should calculate points for shot put 5kg correctly', () => {
      const points = service.calculatePoints('SP5', '13.50', 'MALE');

      expect(points).toBeGreaterThan(0);
      expect(points).toBeLessThan(1200);
      expect(typeof points).toBe('number');
    });
  });

  describe('validatePerformance', () => {
    it('should validate correct time format', () => {
      expect(service.validatePerformance('100M', '10.50')).toBe(true);
      expect(service.validatePerformance('1500M', '4:15.30')).toBe(true);
    });

    it('should validate correct distance format', () => {
      expect(service.validatePerformance('LJ', '7.45')).toBe(true);
      expect(service.validatePerformance('SP', '15.50')).toBe(true);
    });

    it('should validate correct height format', () => {
      expect(service.validatePerformance('HJ', '2.15')).toBe(true);
      expect(service.validatePerformance('PV', '5.80')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(service.validatePerformance('100M', 'invalid')).toBe(false);
      expect(service.validatePerformance('LJ', '-5.00')).toBe(false);
      expect(service.validatePerformance('HJ', '0')).toBe(false);
    });

    it('should reject unrealistic performances', () => {
      expect(service.validatePerformance('100M', '5.00')).toBe(false); // Too fast
      expect(service.validatePerformance('LJ', '50.00')).toBe(false); // Too far
      expect(service.validatePerformance('HJ', '15.00')).toBe(false); // Too high
    });

    it('should validate 80m hurdles performance', () => {
      expect(service.validatePerformance('80MH', '11.50')).toBe(true);
      expect(service.validatePerformance('80MH', '12.80')).toBe(true);
      expect(service.validatePerformance('80MH', '8.00')).toBe(false); // Too fast
    });

    it('should validate 600m performance', () => {
      expect(service.validatePerformance('600M', '1:35.00')).toBe(true);
      expect(service.validatePerformance('600M', '1:45.00')).toBe(true);
      expect(service.validatePerformance('600M', '0:45.00')).toBe(false); // Too fast
    });

    it('should validate 1000m performance', () => {
      expect(service.validatePerformance('1000M', '2:50.00')).toBe(true);
      expect(service.validatePerformance('1000M', '3:15.00')).toBe(true);
      expect(service.validatePerformance('1000M', '1:30.00')).toBe(false); // Too fast
    });

    it('should validate shot put 3kg performance', () => {
      expect(service.validatePerformance('SP3', '11.50')).toBe(true);
      expect(service.validatePerformance('SP3', '9.80')).toBe(true);
      expect(service.validatePerformance('SP3', '25.00')).toBe(false); // Too far
    });

    it('should validate shot put 5kg performance', () => {
      expect(service.validatePerformance('SP5', '13.50')).toBe(true);
      expect(service.validatePerformance('SP5', '11.20')).toBe(true);
      expect(service.validatePerformance('SP5', '30.00')).toBe(false); // Too far
    });
  });

  describe('createCombinedEvent', () => {
    it('should create decathlon with 10 disciplines', async () => {
      const mockCombinedEvent = {
        id: 'test-id',
        eventType: CombinedEventType.DECATHLON,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'MALE',
        totalPoints: 0,
        isComplete: false,
      };

      mockPrismaService.combinedEvent.create.mockResolvedValue(
        mockCombinedEvent,
      );
      mockPrismaService.combinedEventResult.create.mockResolvedValue({
        id: 'result-id',
        combinedEventId: 'test-id',
        discipline: '100M',
        dayOrder: 1,
        performance: null,
        points: 0,
        isValid: false,
      });

      const createDto = {
        eventType: CombinedEventType.DECATHLON,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'MALE' as const,
      };

      const result = await service.createCombinedEvent(createDto);

      expect(mockPrismaService.combinedEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: CombinedEventType.DECATHLON,
          athleteId: 'athlete-id',
          competitionId: 'competition-id',
          gender: 'MALE',
          totalPoints: 0,
          isComplete: false,
        },
      });

      expect(
        mockPrismaService.combinedEventResult.create,
      ).toHaveBeenCalledTimes(10);
      expect(result.results).toHaveLength(10);
    });

    it('should create heptathlon with 7 disciplines', async () => {
      const mockCombinedEvent = {
        id: 'test-id',
        eventType: CombinedEventType.HEPTATHLON,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'FEMALE',
        totalPoints: 0,
        isComplete: false,
      };

      mockPrismaService.combinedEvent.create.mockResolvedValue(
        mockCombinedEvent,
      );
      mockPrismaService.combinedEventResult.create.mockResolvedValue({
        id: 'result-id',
        combinedEventId: 'test-id',
        discipline: '100MH',
        dayOrder: 1,
        performance: null,
        points: 0,
        isValid: false,
      });

      const createDto = {
        eventType: CombinedEventType.HEPTATHLON,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'FEMALE' as const,
      };

      const result = await service.createCombinedEvent(createDto);

      expect(
        mockPrismaService.combinedEventResult.create,
      ).toHaveBeenCalledTimes(7);
      expect(result.results).toHaveLength(7);
    });

    it('should create pentathlon U16 male with 5 disciplines including 110MH', async () => {
      mockPrismaService.combinedEvent.create.mockResolvedValue({
        id: 'combined-event-id',
        eventType: CombinedEventType.PENTATHLON_U16_MALE,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'MALE',
        totalPoints: 0,
        isComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        results: [],
      });

      // Mock dla każdej dyscypliny U16 chłopcy
      const u16MaleDisciplines = ['110MH', 'LJ', 'SP5', 'HJ', '1000M'];
      mockPrismaService.combinedEventResult.create.mockImplementation(
        (data: { data: { discipline: string; dayOrder: number } }) => {
          const disciplineIndex = u16MaleDisciplines.indexOf(
            data.data.discipline,
          );
          return Promise.resolve({
            id: `result-${disciplineIndex}`,
            combinedEventId: 'combined-event-id',
            discipline: data.data.discipline,
            dayOrder: data.data.dayOrder,
            performance: null,
            points: 0,
            wind: null,
            isValid: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        },
      );

      const createDto = {
        eventType: CombinedEventType.PENTATHLON_U16_MALE,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'MALE' as const,
      };

      const result = await service.createCombinedEvent(createDto);

      expect(
        mockPrismaService.combinedEventResult.create,
      ).toHaveBeenCalledTimes(5);
      expect(result.results).toHaveLength(5);

      // Sprawdź czy pierwsza dyscyplina to 110m przez płotki
      const firstDiscipline = result.results.find((r) => r.dayOrder === 1);
      expect(firstDiscipline?.discipline).toBe('110MH');
    });

    it('should create pentathlon U16 female with 5 disciplines including 80MH', async () => {
      mockPrismaService.combinedEvent.create.mockResolvedValue({
        id: 'combined-event-id',
        eventType: CombinedEventType.PENTATHLON_U16_FEMALE,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'FEMALE',
        totalPoints: 0,
        isComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        results: [],
      });

      // Mock dla każdej dyscypliny U16 dziewczęta
      const u16FemaleDisciplines = ['80MH', 'HJ', 'SP3', 'LJ', '600M'];
      mockPrismaService.combinedEventResult.create.mockImplementation(
        (data: { data: { discipline: string; dayOrder: number } }) => {
          const disciplineIndex = u16FemaleDisciplines.indexOf(
            data.data.discipline,
          );
          return Promise.resolve({
            id: `result-${disciplineIndex}`,
            combinedEventId: 'combined-event-id',
            discipline: data.data.discipline,
            dayOrder: data.data.dayOrder,
            performance: null,
            points: 0,
            wind: null,
            isValid: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        },
      );

      const createDto = {
        eventType: CombinedEventType.PENTATHLON_U16_FEMALE,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'FEMALE' as const,
      };

      const result = await service.createCombinedEvent(createDto);

      expect(
        mockPrismaService.combinedEventResult.create,
      ).toHaveBeenCalledTimes(5);
      expect(result.results).toHaveLength(5);

      // Sprawdź czy pierwsza dyscyplina to 80m przez płotki
      const firstDiscipline = result.results.find((r) => r.dayOrder === 1);
      expect(firstDiscipline?.discipline).toBe('80MH');
    });

    it('should throw error for unknown event type', async () => {
      const createDto = {
        eventType: 'UNKNOWN' as CombinedEventType,
        athleteId: 'athlete-id',
        competitionId: 'competition-id',
        gender: 'MALE' as const,
      };

      await expect(service.createCombinedEvent(createDto)).rejects.toThrow(
        'Nieznany typ wieloboju: UNKNOWN',
      );
    });
  });

  describe('updateEventResult', () => {
    it('should update result and recalculate points', async () => {
      const mockCombinedEvent = {
        id: 'test-id',
        eventType: 'DECATHLON',
        gender: 'MALE',
        results: [],
      };

      const mockUpdatedResult = {
        id: 'result-id',
        combinedEventId: 'test-id',
        discipline: '100M',
        performance: '10.50',
        points: 1000,
        wind: '+1.5',
        isValid: true,
      };

      // Mock the transaction to execute the callback with mock prisma
      const mockTransactionPrisma = {
        combinedEvent: {
          findUnique: jest.fn().mockResolvedValue(mockCombinedEvent),
          update: jest.fn().mockResolvedValue({
            ...mockCombinedEvent,
            totalPoints: 1000,
          }),
        },
        combinedEventResult: {
          update: jest.fn().mockResolvedValue(mockUpdatedResult),
          findMany: jest.fn().mockResolvedValue([mockUpdatedResult]),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransactionPrisma);
      });

      const updateDto = {
        performance: '10.50',
        wind: '+1.5',
      };

      const result = await service.updateEventResult(
        'test-id',
        '100M',
        updateDto,
      );

      expect(mockTransactionPrisma.combinedEventResult.update).toHaveBeenCalledWith(
        {
          where: {
            combinedEventId_discipline: {
              combinedEventId: 'test-id',
              discipline: '100M',
            },
          },
          data: {
            performance: '10.50',
            points: expect.any(Number) as number,
            wind: '+1.5',
            isValid: true,
            updatedAt: expect.any(Date) as Date,
          },
        },
      );

      expect(result).toEqual(mockUpdatedResult);
    });

    it('should throw error if combined event not found', async () => {
      // Mock the transaction to execute the callback with mock prisma
      const mockTransactionPrisma = {
        combinedEvent: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransactionPrisma);
      });

      const updateDto = {
        performance: '10.50',
      };

      await expect(
        service.updateEventResult('non-existent-id', '100M', updateDto),
      ).rejects.toThrow('Wielobój nie został znaleziony');
    });
  });

  describe('recalculateTotalPoints', () => {
    it('should calculate total points from valid results', async () => {
      const mockResults = [
        { id: '1', points: 800, isValid: true },
        { id: '2', points: 750, isValid: true },
        { id: '3', points: 900, isValid: false }, // Invalid - should be ignored
        { id: '4', points: 850, isValid: true },
      ];

      const expectedTotal = 800 + 750 + 850; // 2400

      mockPrismaService.combinedEventResult.findMany.mockResolvedValue(
        mockResults,
      );
      mockPrismaService.combinedEvent.update.mockResolvedValue({
        id: 'test-id',
        totalPoints: expectedTotal,
        isComplete: false,
      });

      const result = await service.recalculateTotalPoints('test-id');

      expect(mockPrismaService.combinedEvent.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          totalPoints: expectedTotal,
          isComplete: false, // 3 valid out of 4 total
          updatedAt: expect.any(Date) as Date,
        },
      });

      expect(result.totalPoints).toBe(expectedTotal);
    });

    it('should mark as complete when all results are valid', async () => {
      const mockResults = [
        { id: '1', points: 800, isValid: true },
        { id: '2', points: 750, isValid: true },
      ];

      mockPrismaService.combinedEventResult.findMany.mockResolvedValue(
        mockResults,
      );
      mockPrismaService.combinedEvent.update.mockResolvedValue({
        id: 'test-id',
        totalPoints: 1550,
        isComplete: true,
      });

      const result = await service.recalculateTotalPoints('test-id');

      expect(result.isComplete).toBe(true);
    });
  });
});
