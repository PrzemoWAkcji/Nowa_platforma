import { Test, TestingModule } from '@nestjs/testing';
import { AthletesService } from './athletes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AthletesService - Personal & Season Bests', () => {
  let service: AthletesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    athlete: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AthletesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AthletesService>(AthletesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePersonalAndSeasonBests', () => {
    const mockAthlete = {
      id: 'athlete-1',
      personalBests: {},
      seasonBests: {},
    };

    beforeEach(() => {
      mockPrismaService.athlete.findUnique.mockResolvedValue(mockAthlete);
      mockPrismaService.athlete.update.mockResolvedValue(mockAthlete);
    });

    it('should set new PB and SB for first result', async () => {
      const result = await service.updatePersonalAndSeasonBests(
        'athlete-1',
        '100M',
        '10.50',
        new Date('2024-06-15'),
        'Test Championship',
      );

      expect(result.isNewPB).toBe(true);
      expect(result.isNewSB).toBe(true);
      expect(mockPrismaService.athlete.update).toHaveBeenCalledWith({
        where: { id: 'athlete-1' },
        data: {
          personalBests: {
            '100M': {
              result: '10.50',
              date: '2024-06-15',
              competition: 'Test Championship',
            },
          },
          seasonBests: {
            '100M': {
              result: '10.50',
              date: '2024-06-15',
              competition: 'Test Championship',
            },
          },
        },
      });
    });

    it('should update PB when new result is better', async () => {
      mockAthlete.personalBests = {
        '100M': {
          result: '10.80',
          date: '2023-05-20',
          competition: 'Old Competition',
        },
      };
      mockAthlete.seasonBests = {
        '100M': {
          result: '10.70',
          date: '2024-05-20',
          competition: 'Season Start',
        },
      };

      const result = await service.updatePersonalAndSeasonBests(
        'athlete-1',
        '100M',
        '10.45',
        new Date('2024-07-15'),
        'New Championship',
      );

      expect(result.isNewPB).toBe(true);
      expect(result.isNewSB).toBe(true);
    });

    it('should not update PB when new result is worse', async () => {
      mockAthlete.personalBests = {
        '100M': {
          result: '10.30',
          date: '2023-05-20',
          competition: 'Best Competition',
        },
      };
      mockAthlete.seasonBests = {}; // Reset SB

      const result = await service.updatePersonalAndSeasonBests(
        'athlete-1',
        '100M',
        '10.80',
        new Date('2024-07-15'),
        'New Championship',
      );

      expect(result.isNewPB).toBe(false);
      expect(result.isNewSB).toBe(true); // Still new SB for current year
    });

    it('should handle field events correctly (higher is better)', async () => {
      const result = await service.updatePersonalAndSeasonBests(
        'athlete-1',
        'LJ',
        '7.45',
        new Date('2024-06-15'),
        'Jump Competition',
      );

      expect(result.isNewPB).toBe(true);
      expect(result.isNewSB).toBe(true);
    });

    it('should not update SB for previous year results', async () => {
      const result = await service.updatePersonalAndSeasonBests(
        'athlete-1',
        '100M',
        '10.50',
        new Date('2023-06-15'), // Previous year
        'Old Championship',
      );

      expect(result.isNewSB).toBe(false);
    });
  });

  describe('compareResults', () => {
    it('should correctly compare time-based events', () => {
      // Access private method for testing
      const compareResults = (service as any).compareResults.bind(service);

      expect(compareResults('10.50', '10.80', '100M')).toBe(true);
      expect(compareResults('10.80', '10.50', '100M')).toBe(false);
      expect(compareResults('1:45.30', '1:50.00', '800M')).toBe(true);
    });

    it('should correctly compare field events', () => {
      const compareResults = (service as any).compareResults.bind(service);

      expect(compareResults('7.50', '7.30', 'LJ')).toBe(true);
      expect(compareResults('7.30', '7.50', 'LJ')).toBe(false);
      expect(compareResults('2.15', '2.10', 'HJ')).toBe(true);
    });
  });

  describe('parseTimeToSeconds', () => {
    it('should parse different time formats correctly', () => {
      const parseTime = (service as any).parseTimeToSeconds.bind(service);

      expect(parseTime('10.50')).toBe(10.5);
      expect(parseTime('1:45.30')).toBe(105.3);
      expect(parseTime('2:15:30.25')).toBe(8130.25);
    });
  });

  describe('getAthleteRecords', () => {
    it('should return athlete records for specific event', async () => {
      const mockAthleteWithRecords = {
        id: 'athlete-1',
        firstName: 'John',
        lastName: 'Doe',
        personalBests: {
          '100M': {
            result: '10.50',
            date: '2024-06-15',
            competition: 'Championship',
          },
        },
        seasonBests: {
          '100M': {
            result: '10.60',
            date: '2024-05-20',
            competition: 'Regional',
          },
        },
      };

      mockPrismaService.athlete.findUnique.mockResolvedValue(
        mockAthleteWithRecords,
      );

      const result = await service.getAthleteRecords('athlete-1', '100M');

      expect(result.event).toBe('100M');
      expect(result.personalBest.result).toBe('10.50');
      expect(result.seasonBest.result).toBe('10.60');
    });

    it('should return all records when no event specified', async () => {
      const mockAthleteWithRecords = {
        id: 'athlete-1',
        firstName: 'John',
        lastName: 'Doe',
        personalBests: {
          '100M': {
            result: '10.50',
            date: '2024-06-15',
            competition: 'Championship',
          },
          LJ: { result: '7.45', date: '2024-07-01', competition: 'Jump Meet' },
        },
        seasonBests: {
          '100M': {
            result: '10.60',
            date: '2024-05-20',
            competition: 'Regional',
          },
        },
      };

      mockPrismaService.athlete.findUnique.mockResolvedValue(
        mockAthleteWithRecords,
      );

      const result = await service.getAthleteRecords('athlete-1');

      expect(result.personalBests['100M']).toBeDefined();
      expect(result.personalBests['LJ']).toBeDefined();
      expect(result.seasonBests['100M']).toBeDefined();
    });
  });

  describe('getAthletesSortedByRecords', () => {
    it('should sort athletes by personal bests correctly', async () => {
      const mockAthletes = [
        {
          id: 'athlete-1',
          firstName: 'John',
          lastName: 'Doe',
          club: 'Club A',
          category: 'SENIOR',
          gender: 'MALE',
          personalBests: {
            '100M': {
              result: '10.80',
              date: '2024-06-15',
              competition: 'Championship',
            },
          },
          seasonBests: {},
        },
        {
          id: 'athlete-2',
          firstName: 'Jane',
          lastName: 'Smith',
          club: 'Club B',
          category: 'SENIOR',
          gender: 'MALE',
          personalBests: {
            '100M': {
              result: '10.50',
              date: '2024-06-15',
              competition: 'Championship',
            },
          },
          seasonBests: {},
        },
      ];

      mockPrismaService.athlete.findMany.mockResolvedValue(mockAthletes);

      const result = await service.getAthletesSortedByRecords(
        '100M',
        'PB',
        'MALE',
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('athlete-2'); // Faster time should be first
      expect(result[1].id).toBe('athlete-1');
    });

    it('should handle athletes without records', async () => {
      const mockAthletes = [
        {
          id: 'athlete-1',
          firstName: 'John',
          lastName: 'Doe',
          club: 'Club A',
          category: 'SENIOR',
          gender: 'MALE',
          personalBests: {},
          seasonBests: {},
        },
        {
          id: 'athlete-2',
          firstName: 'Jane',
          lastName: 'Smith',
          club: 'Club B',
          category: 'SENIOR',
          gender: 'MALE',
          personalBests: {
            '100M': {
              result: '10.50',
              date: '2024-06-15',
              competition: 'Championship',
            },
          },
          seasonBests: {},
        },
      ];

      mockPrismaService.athlete.findMany.mockResolvedValue(mockAthletes);

      const result = await service.getAthletesSortedByRecords('100M', 'PB');

      expect(result).toHaveLength(1); // Only athlete with record
      expect(result[0].id).toBe('athlete-2');
    });
  });

  describe('clearSeasonBests', () => {
    it('should clear old season bests', async () => {
      const mockAthletes = [
        {
          id: 'athlete-1',
          seasonBests: {
            '100M': {
              result: '10.50',
              date: '2023-06-15',
              competition: 'Old Championship',
            },
            '200M': {
              result: '21.50',
              date: '2024-06-15',
              competition: 'Current Championship',
            },
          },
        },
      ];

      mockPrismaService.athlete.findMany.mockResolvedValue(mockAthletes);
      mockPrismaService.athlete.update.mockResolvedValue({});

      const result = await service.clearSeasonBests(2024);

      expect(result.clearedAthletes).toBe(1);
      expect(mockPrismaService.athlete.update).toHaveBeenCalledWith({
        where: { id: 'athlete-1' },
        data: {
          seasonBests: {
            '200M': {
              result: '21.50',
              date: '2024-06-15',
              competition: 'Current Championship',
            },
          },
        },
      });
    });
  });
});
