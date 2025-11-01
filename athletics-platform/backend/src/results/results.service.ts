import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AthletesService } from '../athletes/athletes.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecordsService } from '../records/records.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);

  constructor(
    private prisma: PrismaService,
    private athletesService: AthletesService,
    private recordsService: RecordsService,
  ) {}

  async create(createResultDto: CreateResultDto) {
    // Verify athlete exists
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: createResultDto.athleteId },
    });

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: createResultDto.eventId },
      include: {
        competition: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Verify registration exists
    const registration = await this.prisma.registration.findUnique({
      where: { id: createResultDto.registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Check if result already exists for this athlete/event combination
    const existingResult = await this.prisma.result.findFirst({
      where: {
        athleteId: createResultDto.athleteId,
        eventId: createResultDto.eventId,
        registrationId: createResultDto.registrationId,
      },
    });

    if (existingResult) {
      throw new BadRequestException(
        'Result already exists for this athlete/event combination',
      );
    }

    // Automatycznie aktualizuj PB i SB jeśli wynik jest ważny
    let isPersonalBest = createResultDto.isPersonalBest ?? false;
    let isSeasonBest = createResultDto.isSeasonBest ?? false;

    if (
      createResultDto.isValid !== false &&
      !createResultDto.isDNF &&
      !createResultDto.isDNS &&
      !createResultDto.isDQ &&
      createResultDto.result
    ) {
      try {
        // Określ nazwę konkurencji na podstawie event
        const eventName = this.getEventNameForRecords(event);

        // Aktualizuj PB i SB
        const recordsUpdate =
          await this.athletesService.updatePersonalAndSeasonBests(
            createResultDto.athleteId,
            eventName,
            createResultDto.result,
            event.competition?.startDate || new Date(),
            event.competition?.name || 'Unknown Competition',
          );

        isPersonalBest = recordsUpdate.isNewPB;
        isSeasonBest = recordsUpdate.isNewSB;
      } catch (error) {
        this.logger.warn('Failed to update PB/SB:', error.message);
        // Kontynuuj tworzenie wyniku nawet jeśli aktualizacja PB/SB się nie powiodła
      }
    }

    // Automatyczne wykrywanie rekordów zgodnie z przepisami LA
    const recordChecks = await this.checkForRecords(
      createResultDto.athleteId,
      createResultDto.eventId,
      createResultDto.result,
    );

    return this.prisma.result.create({
      data: {
        ...createResultDto,
        isValid: createResultDto.isValid ?? true,
        isDNF: createResultDto.isDNF ?? false,
        isDNS: createResultDto.isDNS ?? false,
        isDQ: createResultDto.isDQ ?? false,
        isPersonalBest,
        isSeasonBest,
        isNationalRecord:
          recordChecks.isNationalRecord ||
          createResultDto.isNationalRecord ||
          false,
        isWorldRecord:
          recordChecks.isWorldRecord || createResultDto.isWorldRecord || false,
      },
      include: {
        athlete: true,
        event: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                location: true,
              },
            },
          },
        },
        registration: true,
      },
    });
  }

  async findAll() {
    return this.prisma.result.findMany({
      include: {
        athlete: true,
        event: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                location: true,
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

  async findByEvent(eventId: string) {
    return this.prisma.result.findMany({
      where: { eventId },
      include: {
        athlete: true,
        event: true,
      },
      orderBy: [{ position: 'asc' }, { result: 'asc' }],
    });
  }

  async findByAthlete(athleteId: string) {
    return this.prisma.result.findMany({
      where: { athleteId },
      include: {
        event: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                location: true,
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
    return this.prisma.result.findMany({
      where: {
        event: {
          competitionId,
        },
      },
      include: {
        athlete: true,
        event: true,
      },
      orderBy: [{ event: { name: 'asc' } }, { position: 'asc' }],
    });
  }

  async findPersonalBests(athleteId: string) {
    return this.prisma.result.findMany({
      where: {
        athleteId,
        isPersonalBest: true,
      },
      include: {
        event: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                location: true,
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

  async findRecords() {
    return this.prisma.result.findMany({
      where: {
        OR: [{ isNationalRecord: true }, { isWorldRecord: true }],
      },
      include: {
        athlete: true,
        event: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                location: true,
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

  async findOne(id: string) {
    const result = await this.prisma.result.findUnique({
      where: { id },
      include: {
        athlete: true,
        event: {
          include: {
            competition: true,
          },
        },
        registration: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    return result;
  }

  async update(id: string, updateResultDto: UpdateResultDto) {
    const result = await this.prisma.result.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    return this.prisma.result.update({
      where: { id },
      data: updateResultDto,
      include: {
        athlete: true,
        event: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                location: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    const result = await this.prisma.result.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    return this.prisma.result.delete({
      where: { id },
    });
  }

  async calculatePositions(eventId: string) {
    const results = await this.prisma.result.findMany({
      where: {
        eventId,
        isValid: true,
        isDNF: false,
        isDNS: false,
        isDQ: false,
      },
      orderBy: {
        result: 'asc', // This is simplified - in reality, you'd need to parse times/distances
      },
    });

    // Update positions
    for (let i = 0; i < results.length; i++) {
      await this.prisma.result.update({
        where: { id: results[i].id },
        data: { position: i + 1 },
      });
    }

    return results;
  }

  async getEventResults(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        competition: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const results = await this.prisma.result.findMany({
      where: { eventId },
      include: {
        athlete: true,
      },
      orderBy: [{ position: 'asc' }, { result: 'asc' }],
    });

    const statistics = {
      totalParticipants: results.length,
      finishers: results.filter((r) => !r.isDNF && !r.isDNS && !r.isDQ).length,
      dnf: results.filter((r) => r.isDNF).length,
      dns: results.filter((r) => r.isDNS).length,
      dq: results.filter((r) => r.isDQ).length,
      personalBests: results.filter((r) => r.isPersonalBest).length,
      seasonBests: results.filter((r) => r.isSeasonBest).length,
      records: results.filter((r) => r.isNationalRecord || r.isWorldRecord)
        .length,
    };

    return {
      event,
      results,
      statistics,
    };
  }

  async getAthleteResultsInEvent(athleteId: string, eventName: string) {
    return this.prisma.result.findMany({
      where: {
        athleteId,
        event: {
          name: eventName,
        },
      },
      include: {
        event: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                location: true,
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

  /**
   * Mapuje nazwę wydarzenia na standardową nazwę konkurencji dla rekordów
   */
  private getEventNameForRecords(event: any): string {
    // Mapowanie nazw wydarzeń na standardowe nazwy konkurencji
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

    // Fallback - użyj oryginalnej nazwy
    return event.name;
  }

  /**
   * Automatyczne sprawdzanie rekordów zgodnie z przepisami LA
   */
  private async checkForRecords(
    athleteId: string,
    eventId: string,
    result: string,
  ): Promise<{ isNationalRecord: boolean; isWorldRecord: boolean }> {
    try {
      // Pobierz informacje o zawodniku i konkurencji
      const athlete = await this.prisma.athlete.findUnique({
        where: { id: athleteId },
        select: { nationality: true, gender: true, category: true },
      });

      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: { name: true, type: true, gender: true, category: true },
      });

      if (!athlete || !event) {
        return { isNationalRecord: false, isWorldRecord: false };
      }

      // Konwertuj wynik na wartość numeryczną do porównania
      const resultValue = this.parseResultToSeconds(result, event.type);
      if (resultValue === null) {
        return { isNationalRecord: false, isWorldRecord: false };
      }

      // Sprawdź rekord kraju
      const nationalRecord = await this.getBestNationalRecord(
        event.name,
        athlete.nationality || 'UNKNOWN',
        athlete.gender,
        athlete.category,
      );

      // Sprawdź rekord świata
      const worldRecord = await this.getBestWorldRecord(
        event.name,
        athlete.gender,
        athlete.category,
      );

      const isNationalRecord = nationalRecord
        ? this.isResultBetter(resultValue, nationalRecord, event.type)
        : false;

      const isWorldRecord = worldRecord
        ? this.isResultBetter(resultValue, worldRecord, event.type)
        : false;

      return { isNationalRecord, isWorldRecord };
    } catch (error) {
      this.logger.warn('Failed to check records:', error.message);
      return { isNationalRecord: false, isWorldRecord: false };
    }
  }

  /**
   * Konwertuje wynik na sekundy lub metry dla porównania
   */
  private parseResultToSeconds(
    result: string,
    eventType: string,
  ): number | null {
    try {
      // Dla biegów - konwertuj na sekundy
      if (eventType === 'TRACK' || eventType === 'HURDLES') {
        // Format: "10.50" lub "2:15.30"
        if (result.includes(':')) {
          const [minutes, seconds] = result.split(':');
          return parseInt(minutes) * 60 + parseFloat(seconds);
        }
        return parseFloat(result);
      }

      // Dla rzutów i skoków - konwertuj na metry
      if (eventType === 'FIELD') {
        // Usuń jednostkę i konwertuj
        return parseFloat(result.replace(/[^\d.]/g, ''));
      }

      return parseFloat(result);
    } catch {
      return null;
    }
  }

  /**
   * Sprawdza czy wynik jest lepszy od rekordu
   */
  private isResultBetter(
    newResult: number,
    recordResult: number,
    eventType: string,
  ): boolean {
    // Dla biegów - mniejszy czas jest lepszy
    if (eventType === 'TRACK' || eventType === 'HURDLES') {
      return newResult < recordResult;
    }
    // Dla rzutów i skoków - większa odległość jest lepsza
    return newResult > recordResult;
  }

  /**
   * Pobiera najlepszy rekord kraju dla danej konkurencji
   */
  private async getBestNationalRecord(
    eventName: string,
    nationality: string,
    gender: string,
    category: string,
  ): Promise<number | null> {
    try {
      const record = await this.recordsService.getBestRecord(
        eventName,
        'NATIONAL',
        gender,
        category,
        nationality,
        false,
      );
      return record ? record.resultValue : null;
    } catch {
      return null;
    }
  }

  /**
   * Pobiera najlepszy rekord świata dla danej konkurencji
   */
  private async getBestWorldRecord(
    eventName: string,
    gender: string,
    category: string,
  ): Promise<number | null> {
    try {
      const record = await this.recordsService.getBestRecord(
        eventName,
        'WORLD',
        gender,
        category,
        undefined,
        false,
      );
      return record ? record.resultValue : null;
    } catch {
      return null;
    }
  }
}
