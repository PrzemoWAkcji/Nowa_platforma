import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createRegistrationDto: CreateRegistrationDto, userId: string) {
    const { athleteId, competitionId, eventIds, ...registrationData } =
      createRegistrationDto;

    // Verify athlete exists and has valid credentials
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId },
    });

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    // Validate athlete credentials according to LA regulations
    await this.validateAthleteCredentials(athlete);

    // Verify competition exists and is open for registration
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Competition not found');
    }

    // Check if registration is open
    const now = new Date();
    if (
      competition.registrationStartDate &&
      now < competition.registrationStartDate
    ) {
      throw new BadRequestException('Registration has not started yet');
    }

    if (
      competition.registrationEndDate &&
      now > competition.registrationEndDate
    ) {
      if (!competition.allowLateRegistration) {
        throw new BadRequestException('Registration has ended');
      }
    }

    // Check if already registered
    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        athleteId_competitionId: {
          athleteId,
          competitionId,
        },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException(
        'Athlete is already registered for this competition',
      );
    }

    // Verify events exist and belong to the competition
    const events = await this.prisma.event.findMany({
      where: {
        id: { in: eventIds },
        competitionId,
      },
    });

    if (events.length !== eventIds.length) {
      throw new BadRequestException(
        'Some events do not exist or do not belong to this competition',
      );
    }

    // Check event capacity
    for (const event of events) {
      if (event.maxParticipants) {
        const currentRegistrations = await this.prisma.registrationEvent.count({
          where: { eventId: event.id },
        });

        if (currentRegistrations >= event.maxParticipants) {
          throw new BadRequestException(`Event "${event.name}" is full`);
        }
      }
    }

    // Create registration with events
    return this.prisma.registration.create({
      data: {
        athleteId,
        competitionId,
        userId,
        ...registrationData,
        events: {
          create: eventIds.map((eventId) => ({
            eventId,
            seedTime: registrationData.seedTime,
          })),
        },
      },
      include: {
        athlete: true,
        competition: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.registration.findMany({
      include: {
        athlete: true,
        competition: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true,
          },
        },
        events: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCompetition(competitionId: string) {
    return this.prisma.registration.findMany({
      where: { competitionId },
      include: {
        athlete: true,
        events: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByCompetitionAndEvent(competitionId: string, eventId: string) {
    return this.prisma.registration.findMany({
      where: {
        competitionId,
        events: {
          some: {
            eventId: eventId,
          },
        },
      },
      include: {
        athlete: true,
        events: {
          where: {
            eventId: eventId,
          },
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Pobiera listę startową posortowaną według PB lub SB
   */
  async getStartListSortedByRecords(
    competitionId: string,
    eventId: string,
    sortBy: 'PB' | 'SB' | 'SEED_TIME' = 'PB',
  ) {
    // Pobierz podstawowe dane rejestracji
    const registrations = await this.findByCompetitionAndEvent(
      competitionId,
      eventId,
    );

    if (registrations.length === 0) {
      return [];
    }

    // Pobierz informacje o wydarzeniu
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { name: true, type: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Określ nazwę konkurencji dla rekordów
    const eventName = this.getEventNameForRecords(event);

    // Wzbogać dane o rekordy zawodników
    const enrichedRegistrations = await Promise.all(
      registrations.map(async (registration) => {
        const athlete = registration.athlete;
        const personalBests = (athlete.personalBests as any) || {};
        const seasonBests = (athlete.seasonBests as any) || {};

        const personalBest = personalBests[eventName];
        const seasonBest = seasonBests[eventName];
        const seedTime = registration.events[0]?.seedTime;

        return {
          ...registration,
          records: {
            personalBest,
            seasonBest,
            seedTime,
          },
        };
      }),
    );

    // Sortuj według wybranego kryterium
    const sortedRegistrations = enrichedRegistrations.sort((a, b) => {
      let aValue: string | null = null;
      let bValue: string | null = null;

      switch (sortBy) {
        case 'PB':
          aValue = a.records.personalBest?.result || null;
          bValue = b.records.personalBest?.result || null;
          break;
        case 'SB':
          aValue = a.records.seasonBest?.result || null;
          bValue = b.records.seasonBest?.result || null;
          break;
        case 'SEED_TIME':
          aValue = a.records.seedTime || null;
          bValue = b.records.seedTime || null;
          break;
      }

      // Zawodnicy bez wyników na końcu
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      // Sortuj według typu konkurencji
      const isTimeEvent = this.isTimeBasedEvent(eventName);

      if (isTimeEvent) {
        // Dla biegów - najszybszy pierwszy
        return (
          this.parseTimeToSeconds(aValue) - this.parseTimeToSeconds(bValue)
        );
      } else {
        // Dla skoków i rzutów - najdalej/najwyżej pierwszy
        return parseFloat(bValue) - parseFloat(aValue);
      }
    });

    return sortedRegistrations;
  }

  async findByAthlete(athleteId: string) {
    return this.prisma.registration.findMany({
      where: { athleteId },
      include: {
        competition: true,
        events: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.registration.findMany({
      where: { userId },
      include: {
        athlete: true,
        competition: true,
        events: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        athlete: true,
        competition: true,
        events: {
          include: {
            event: true,
          },
        },
        results: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async update(id: string, updateRegistrationDto: UpdateRegistrationDto) {
    this.logger.debug(`Updating registration: ${id}`);

    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const { eventIds, ...updateData } = updateRegistrationDto;

    // If eventIds are provided, update the events
    if (eventIds) {
      // Remove existing events
      await this.prisma.registrationEvent.deleteMany({
        where: { registrationId: id },
      });

      // Add new events
      await this.prisma.registrationEvent.createMany({
        data: eventIds.map((eventId) => ({
          registrationId: id,
          eventId,
          seedTime: updateData.seedTime,
        })),
      });
    }

    const updatedRegistration = await this.prisma.registration.update({
      where: { id },
      data: updateData,
      include: {
        athlete: true,
        competition: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    });

    this.logger.log(`Registration updated successfully: ${id}`);
    return updatedRegistration;
  }

  async remove(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return this.prisma.registration.delete({
      where: { id },
    });
  }

  async confirmRegistration(id: string) {
    return this.prisma.registration.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        paymentDate: new Date(),
      },
      include: {
        athlete: true,
        competition: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  async cancelRegistration(id: string) {
    return this.update(id, {
      status: 'CANCELLED' as any,
    });
  }

  async rejectRegistration(id: string) {
    return this.prisma.registration.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
      include: {
        athlete: true,
        competition: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  /**
   * Automatyczne przydzielanie numerów startowych dla zawodów
   * Zgodnie z przepisami LA, każdy zawodnik musi mieć unikalny numer startowy
   */
  async assignBibNumbers(competitionId: string, startingNumber: number = 1) {
    const registrations = await this.prisma.registration.findMany({
      where: {
        competitionId,
        status: 'CONFIRMED',
        bibNumber: null, // Tylko rejestracje bez przydzielonego numeru
      },
      include: {
        athlete: true,
      },
      orderBy: [
        { athlete: { lastName: 'asc' } },
        { athlete: { firstName: 'asc' } },
      ],
    });

    if (registrations.length === 0) {
      return {
        message: 'Brak rejestracji do przydzielenia numerów startowych',
        assigned: 0,
      };
    }

    // Znajdź najwyższy istniejący numer startowy w zawodach
    const existingRegistrations = await this.prisma.registration.findMany({
      where: {
        competitionId,
        bibNumber: { not: null },
      },
      select: { bibNumber: true },
    });

    const existingNumbers = existingRegistrations
      .map((r) => parseInt(r.bibNumber || '0'))
      .filter((n) => !isNaN(n));

    const maxExistingNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    let currentNumber = Math.max(startingNumber, maxExistingNumber + 1);

    const updates: any[] = [];
    for (const registration of registrations) {
      updates.push(
        this.prisma.registration.update({
          where: { id: registration.id },
          data: { bibNumber: currentNumber.toString() },
        }),
      );
      currentNumber++;
    }

    await Promise.all(updates);

    return {
      message: `Przydzielono numery startowe dla ${registrations.length} zawodników`,
      assigned: registrations.length,
      startingNumber: Math.max(startingNumber, maxExistingNumber + 1),
      endingNumber: currentNumber - 1,
    };
  }

  /**
   * Walidacja uprawnień zawodnika zgodnie z przepisami LA
   */
  private async validateAthleteCredentials(athlete: any) {
    const errors: string[] = [];

    // Sprawdź czy zawodnik ma numer licencji (wymagany dla zawodów oficjalnych)
    if (!athlete.licenseNumber) {
      errors.push('Zawodnik nie posiada numeru licencji');
    }

    // Sprawdź czy zawodnik para-atletyczny ma odpowiednią klasyfikację
    if (athlete.isParaAthlete && !athlete.classification) {
      errors.push(
        'Zawodnik para-atletyczny musi mieć przydzieloną klasyfikację',
      );
    }

    // Sprawdź czy zawodnik ma wypełnione wymagane dane
    if (!athlete.dateOfBirth) {
      errors.push('Brak daty urodzenia zawodnika');
    }

    if (!athlete.nationality) {
      errors.push('Brak informacji o narodowości zawodnika');
    }

    // Sprawdź czy zawodnik nie jest za młody (minimum 16 lat dla zawodów seniorskich)
    if (athlete.dateOfBirth) {
      const age = this.calculateAge(new Date(athlete.dateOfBirth));
      if (age < 16) {
        errors.push(
          'Zawodnik jest za młody do udziału w zawodach (minimum 16 lat)',
        );
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(
        `Błędy walidacji zawodnika: ${errors.join(', ')}`,
      );
    }
  }

  /**
   * Oblicza wiek zawodnika
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  async getRegistrationStatistics(competitionId?: string) {
    const where = competitionId ? { competitionId } : {};

    const totalRegistrations = await this.prisma.registration.count({ where });

    const statusCounts = await this.prisma.registration.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const paymentCounts = await this.prisma.registration.groupBy({
      by: ['paymentStatus'],
      where,
      _count: true,
    });

    return {
      totalRegistrations,
      statusDistribution: statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      paymentDistribution: paymentCounts.reduce(
        (acc, item) => {
          acc[item.paymentStatus] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Mapuje nazwę wydarzenia na standardową nazwę konkurencji dla rekordów
   */
  private getEventNameForRecords(event: any): string {
    const eventName = event.name.toUpperCase();

    // Biegi
    if (
      eventName.includes('100') &&
      eventName.includes('M') &&
      !eventName.includes('H')
    )
      return '100M';
    if (eventName.includes('200') && eventName.includes('M')) return '200M';
    if (
      eventName.includes('400') &&
      eventName.includes('M') &&
      !eventName.includes('H')
    )
      return '400M';
    if (eventName.includes('800') && eventName.includes('M')) return '800M';
    if (eventName.includes('1500') && eventName.includes('M')) return '1500M';
    if (
      eventName.includes('3000') &&
      eventName.includes('M') &&
      !eventName.includes('SC')
    )
      return '3000M';
    if (eventName.includes('5000') && eventName.includes('M')) return '5000M';
    if (eventName.includes('10000') && eventName.includes('M')) return '10000M';

    // Płotki
    if (eventName.includes('110') && eventName.includes('H')) return '110MH';
    if (eventName.includes('100') && eventName.includes('H')) return '100MH';
    if (eventName.includes('400') && eventName.includes('H')) return '400MH';
    if (eventName.includes('80') && eventName.includes('H')) return '80MH';

    // Biegi specjalne
    if (eventName.includes('600') && eventName.includes('M')) return '600M';
    if (eventName.includes('1000') && eventName.includes('M')) return '1000M';
    if (eventName.includes('3000') && eventName.includes('SC'))
      return '3000MSC';

    // Skoki
    if (eventName.includes('LONG') || eventName.includes('SKOK W DAL'))
      return 'LJ';
    if (eventName.includes('HIGH') || eventName.includes('SKOK WZWYŻ'))
      return 'HJ';
    if (eventName.includes('POLE') || eventName.includes('SKOK O TYCZCE'))
      return 'PV';
    if (eventName.includes('TRIPLE') || eventName.includes('TRÓJSKOK'))
      return 'TJ';

    // Rzuty
    if (eventName.includes('SHOT') || eventName.includes('PCHNIĘCIE KULĄ')) {
      if (eventName.includes('3KG') || eventName.includes('3 KG')) return 'SP3';
      if (eventName.includes('5KG') || eventName.includes('5 KG')) return 'SP5';
      return 'SP';
    }
    if (eventName.includes('DISCUS') || eventName.includes('RZUT DYSKIEM'))
      return 'DT';
    if (eventName.includes('HAMMER') || eventName.includes('RZUT MŁOTEM'))
      return 'HT';
    if (eventName.includes('JAVELIN') || eventName.includes('RZUT OSZCZEPEM'))
      return 'JT';

    return event.name;
  }

  /**
   * Sprawdza czy konkurencja jest oparta na czasie
   */
  private isTimeBasedEvent(eventName: string): boolean {
    const timeEvents = [
      '100M',
      '200M',
      '400M',
      '800M',
      '1500M',
      '3000M',
      '5000M',
      '10000M',
      '110MH',
      '100MH',
      '400MH',
      '3000MSC',
      '80MH',
      '600M',
      '1000M',
    ];
    return timeEvents.includes(eventName);
  }

  /**
   * Konwertuje czas w formacie string na sekundy
   */
  private parseTimeToSeconds(timeString: string): number {
    const parts = timeString.split(':');

    if (parts.length === 1) {
      return parseFloat(parts[0]);
    } else if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    } else if (parts.length === 3) {
      return (
        parseInt(parts[0]) * 3600 +
        parseInt(parts[1]) * 60 +
        parseFloat(parts[2])
      );
    }

    return parseFloat(timeString);
  }
}
