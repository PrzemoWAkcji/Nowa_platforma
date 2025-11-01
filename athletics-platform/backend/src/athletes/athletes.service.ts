import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as iconv from 'iconv-lite';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';

interface CsvRow {
  [key: string]: string;
}

export interface ImportResults {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

@Injectable()
export class AthletesService {
  private readonly logger = new Logger(AthletesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createAthleteDto: CreateAthleteDto) {
    return this.prisma.athlete.create({
      data: {
        ...createAthleteDto,
        dateOfBirth: new Date(createAthleteDto.dateOfBirth),
        isParaAthlete: createAthleteDto.isParaAthlete || false,
      },
    });
  }

  async findAll() {
    return this.prisma.athlete.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        club: true,
        nationality: true,
        isParaAthlete: true,
        _count: {
          select: {
            registrations: true,
            results: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
      take: 100, // Limit do 100 zawodników
    });
  }

  async findOne(id: string) {
    return this.prisma.athlete.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            competition: true,
            events: {
              include: {
                event: true,
              },
            },
          },
        },
        results: {
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
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findByCoach(coachId: string) {
    return this.prisma.athlete.findMany({
      where: {
        coachId: coachId,
      },
      include: {
        _count: {
          select: {
            registrations: true,
            results: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findByCategory(category: string) {
    // Validate that the category is a valid enum value
    const validCategories = [
      'U16',
      'U18',
      'U20',
      'SENIOR',
      'M35',
      'M40',
      'M45',
      'M50',
      'M55',
      'M60',
      'M65',
      'M70',
      'M75',
      'M80',
    ];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category value: ${category}`);
    }

    return this.prisma.athlete.findMany({
      where: {
        category: category as
          | 'U16'
          | 'U18'
          | 'U20'
          | 'SENIOR'
          | 'M35'
          | 'M40'
          | 'M45'
          | 'M50'
          | 'M55'
          | 'M60'
          | 'M65'
          | 'M70'
          | 'M75'
          | 'M80',
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findByGender(gender: string) {
    // Map input values to enum values
    const genderMap: { [key: string]: 'MALE' | 'FEMALE' | 'MIXED' } = {
      M: 'MALE',
      K: 'FEMALE',
      MALE: 'MALE',
      FEMALE: 'FEMALE',
      MIXED: 'MIXED',
    };

    const mappedGender = genderMap[gender.toUpperCase()];
    if (!mappedGender) {
      throw new Error(`Invalid gender value: ${gender}`);
    }

    return this.prisma.athlete.findMany({
      where: { gender: mappedGender },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findParaAthletes() {
    return this.prisma.athlete.findMany({
      where: { isParaAthlete: true },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async update(id: string, updateAthleteDto: UpdateAthleteDto) {
    const updateData: any = {
      ...updateAthleteDto,
    };

    if (updateAthleteDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateAthleteDto.dateOfBirth);
    }

    return this.prisma.athlete.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.athlete.delete({
      where: { id },
    });
  }

  async getAthleteStats(id: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id },
      include: {
        results: {
          include: {
            event: true,
          },
        },
        registrations: true,
      },
    });

    if (!athlete) {
      return null;
    }

    const personalBests = athlete.results.filter(
      (result) => result.isPersonalBest,
    );
    const seasonBests = athlete.results.filter((result) => result.isSeasonBest);
    const totalCompetitions = athlete.registrations.length;
    const totalResults = athlete.results.length;

    return {
      athlete,
      stats: {
        totalCompetitions,
        totalResults,
        personalBests: personalBests.length,
        seasonBests: seasonBests.length,
        nationalRecords: athlete.results.filter((r) => r.isNationalRecord)
          .length,
        worldRecords: athlete.results.filter((r) => r.isWorldRecord).length,
      },
      recentResults: athlete.results
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10),
    };
  }

  async importFromCsv(
    fileBuffer: Buffer,
    format: 'pzla' | 'international' | 'auto',
    updateExisting: boolean = false,
  ): Promise<ImportResults> {
    const results: ImportResults = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    try {
      const csvData = await this.parseCsv(fileBuffer);

      // Automatyczne wykrywanie formatu jeśli wybrano 'auto'
      let detectedFormat = format;
      if (format === 'auto' && csvData.length > 0) {
        detectedFormat = this.detectFormat(csvData[0]);
      }

      for (const row of csvData) {
        try {
          const athleteData = this.mapCsvRowToAthlete(
            row,
            detectedFormat as 'pzla' | 'international',
          );

          if (!athleteData) {
            results.skipped++;
            continue;
          }

          // Sprawdź czy zawodnik już istnieje
          const existingAthlete = await this.findExistingAthlete(athleteData);

          if (existingAthlete) {
            if (updateExisting) {
              await this.update(existingAthlete.id, athleteData);
              results.updated++;
            } else {
              results.skipped++;
            }
          } else {
            await this.create(athleteData);
            results.imported++;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Row error: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`CSV parsing error: ${errorMessage}`);
    }

    return results;
  }

  private async parseCsv(fileBuffer: Buffer): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const results: CsvRow[] = [];

      // Spróbuj różnych kodowań
      let csvData: string;
      try {
        // Najpierw spróbuj UTF-8
        csvData = fileBuffer.toString('utf-8');
        // Sprawdź czy są znaki zastępcze (�)
        if (csvData.includes('�')) {
          // Spróbuj Windows-1250 (polskie kodowanie)
          csvData = iconv.decode(fileBuffer, 'windows-1250');
          // Jeśli nadal są problemy, spróbuj ISO-8859-2
          if (csvData.includes('�')) {
            csvData = iconv.decode(fileBuffer, 'iso-8859-2');
          }
        }
      } catch {
        // Fallback do UTF-8
        csvData = fileBuffer.toString('utf-8');
      }

      const stream = Readable.from(csvData);

      stream
        .pipe(csv({ separator: ';' })) // Używamy średnika jako separatora
        .on('data', (data: CsvRow) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private detectFormat(firstRow: CsvRow): 'pzla' | 'international' {
    // Sprawdź charakterystyczne kolumny dla każdego formatu
    const pzlaColumns = ['Nazwisko', 'Imię', 'DataUr', 'NazwaPZLA', 'Klub'];
    const internationalColumns = [
      'FirstName',
      'LastName',
      'DateOfBirth',
      'Gender',
      'ClubName',
    ];

    const hasPZLAColumns = pzlaColumns.some((col) =>
      Object.prototype.hasOwnProperty.call(firstRow, col),
    );
    const hasInternationalColumns = internationalColumns.some((col) =>
      Object.prototype.hasOwnProperty.call(firstRow, col),
    );

    if (hasPZLAColumns) {
      return 'pzla';
    } else if (hasInternationalColumns) {
      return 'international';
    }

    // Domyślnie PZLA
    return 'pzla';
  }

  private mapCsvRowToAthlete(
    row: CsvRow,
    format: 'pzla' | 'international',
  ): CreateAthleteDto | null {
    try {
      if (format === 'pzla') {
        return this.mapPzlaFormat(row);
      } else {
        return this.mapInternationalFormat(row);
      }
    } catch (error) {
      this.logger.error('Error mapping CSV row:', error);
      return null;
    }
  }

  private mapPzlaFormat(row: CsvRow): CreateAthleteDto | null {
    // Format PZLA (starter.csv)
    const firstName = row['Imię']?.trim() || '';
    const lastName = row['Nazwisko']?.trim() || '';
    const dateOfBirth = row['DataUr']?.trim() || '';
    const club = row['Klub']?.trim() || '';

    if (!firstName || !lastName || !dateOfBirth) {
      return null;
    }

    // Określ płeć na podstawie nazwy konkurencji
    const eventName = row['NazwaPZLA'] || '';
    const gender: 'MALE' | 'FEMALE' =
      eventName.toLowerCase().includes('kobiet') || eventName.startsWith('K')
        ? 'FEMALE'
        : 'MALE';

    // Określ kategorię na podstawie daty urodzenia
    const category = this.calculateCategory(dateOfBirth);

    return {
      firstName,
      lastName,
      dateOfBirth,
      gender: gender as any,
      club: club || undefined,
      category: category as any,
      nationality: 'POL', // Domyślnie Polska dla PZLA
    };
  }

  private mapInternationalFormat(row: CsvRow): CreateAthleteDto | null {
    // Format międzynarodowy (roster.csv)
    const firstName = row['FirstName']?.trim() || '';
    const lastName = row['LastName']?.trim() || '';
    const dateOfBirth = row['DateOfBirth']?.trim() || '';
    const club = row['ClubName']?.trim() || '';
    const gender = row['Gender']?.trim() || '';
    const nationality = row['CountryCode']?.trim() || '';

    if (!firstName || !lastName || !dateOfBirth) {
      return null;
    }

    // Mapuj płeć
    const mappedGender: 'MALE' | 'FEMALE' =
      gender === 'Male' ? 'MALE' : gender === 'Female' ? 'FEMALE' : 'MALE';

    // Określ kategorię na podstawie daty urodzenia
    const category = this.calculateCategory(dateOfBirth);

    return {
      firstName,
      lastName,
      dateOfBirth,
      gender: mappedGender as any,
      club: club || undefined,
      category: category as any,
      nationality: nationality || 'POL',
    };
  }

  private calculateCategory(
    dateOfBirth: string,
  ):
    | 'U16'
    | 'U18'
    | 'U20'
    | 'SENIOR'
    | 'M35'
    | 'M40'
    | 'M45'
    | 'M50'
    | 'M55'
    | 'M60'
    | 'M65'
    | 'M70'
    | 'M75'
    | 'M80' {
    const birthYear = new Date(dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age <= 16) return 'U16';
    if (age <= 18) return 'U18';
    if (age <= 20) return 'U20';
    if (age < 35) return 'SENIOR';
    if (age < 40) return 'M35';
    if (age < 45) return 'M40';
    if (age < 50) return 'M45';
    if (age < 55) return 'M50';
    if (age < 60) return 'M55';
    if (age < 65) return 'M60';
    if (age < 70) return 'M65';
    if (age < 75) return 'M70';
    if (age < 80) return 'M75';
    return 'M80';
  }

  private async findExistingAthlete(athleteData: CreateAthleteDto) {
    return this.prisma.athlete.findFirst({
      where: {
        firstName: athleteData.firstName,
        lastName: athleteData.lastName,
        dateOfBirth: new Date(athleteData.dateOfBirth),
      },
    });
  }

  // ===== PERSONAL BESTS & SEASON BESTS METHODS =====

  /**
   * Aktualizuje PB i SB zawodnika na podstawie nowego wyniku
   */
  async updatePersonalAndSeasonBests(
    athleteId: string,
    eventName: string,
    result: string,
    competitionDate: Date,
    competitionName: string,
  ) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId },
      select: {
        id: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    if (!athlete) {
      throw new Error('Athlete not found');
    }

    const currentYear = new Date().getFullYear();
    const resultYear = competitionDate.getFullYear();

    // Pobierz obecne PB i SB
    const personalBests = (athlete.personalBests as any) || {};
    const seasonBests = (athlete.seasonBests as any) || {};

    // Sprawdź czy to nowy PB
    const currentPB = personalBests[eventName];
    const isNewPB =
      !currentPB || this.compareResults(result, currentPB.result, eventName);

    // Sprawdź czy to nowy SB (dla roku wyniku)
    const currentSB = seasonBests[eventName];
    const isNewSB =
      !currentSB ||
      new Date(currentSB.date).getFullYear() < resultYear ||
      (new Date(currentSB.date).getFullYear() === resultYear &&
        this.compareResults(result, currentSB.result, eventName));

    // Aktualizuj PB jeśli to nowy rekord życiowy
    if (isNewPB) {
      personalBests[eventName] = {
        result,
        date: competitionDate.toISOString().split('T')[0],
        competition: competitionName,
      };
    }

    // Aktualizuj SB jeśli to nowy rekord sezonu
    if (isNewSB) {
      seasonBests[eventName] = {
        result,
        date: competitionDate.toISOString().split('T')[0],
        competition: competitionName,
      };
    }

    // Zapisz zmiany w bazie danych
    if (isNewPB || isNewSB) {
      await this.prisma.athlete.update({
        where: { id: athleteId },
        data: {
          personalBests,
          seasonBests,
        },
      });
    }

    return {
      isNewPB,
      isNewSB,
      personalBest: personalBests[eventName],
      seasonBest: seasonBests[eventName],
    };
  }

  /**
   * Porównuje dwa wyniki - zwraca true jeśli newResult jest lepszy niż currentResult
   */
  private compareResults(
    newResult: string,
    currentResult: string,
    eventName: string,
  ): boolean {
    // Określ typ konkurencji na podstawie nazwy
    const isTimeEvent = this.isTimeBasedEvent(eventName);

    if (isTimeEvent) {
      // Dla biegów - mniejszy czas jest lepszy
      return (
        this.parseTimeToSeconds(newResult) <
        this.parseTimeToSeconds(currentResult)
      );
    } else {
      // Dla skoków i rzutów - większa odległość/wysokość jest lepsza
      return parseFloat(newResult) > parseFloat(currentResult);
    }
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
    // Format: "10.50" lub "1:23.45" lub "2:15:30.25"
    const parts = timeString.split(':');

    if (parts.length === 1) {
      // Tylko sekundy: "10.50"
      return parseFloat(parts[0]);
    } else if (parts.length === 2) {
      // Minuty:sekundy: "1:23.45"
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    } else if (parts.length === 3) {
      // Godziny:minuty:sekundy: "2:15:30.25"
      return (
        parseInt(parts[0]) * 3600 +
        parseInt(parts[1]) * 60 +
        parseFloat(parts[2])
      );
    }

    return parseFloat(timeString); // Fallback
  }

  /**
   * Pobiera PB i SB zawodnika dla konkretnej konkurencji
   */
  async getAthleteRecords(athleteId: string, eventName?: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    if (!athlete) {
      throw new Error('Athlete not found');
    }

    const personalBests = (athlete.personalBests as any) || {};
    const seasonBests = (athlete.seasonBests as any) || {};

    if (eventName) {
      return {
        athlete: {
          id: athlete.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
        },
        event: eventName,
        personalBest: personalBests[eventName] || null,
        seasonBest: seasonBests[eventName] || null,
      };
    }

    return {
      athlete: {
        id: athlete.id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
      },
      personalBests,
      seasonBests,
    };
  }

  /**
   * Pobiera listę zawodników posortowaną według PB lub SB dla konkretnej konkurencji
   */
  async getAthletesSortedByRecords(
    eventName: string,
    sortBy: 'PB' | 'SB' = 'PB',
    gender?: 'MALE' | 'FEMALE',
    category?: string,
    limit: number = 50,
  ) {
    const whereClause: any = {};

    if (gender) {
      whereClause.gender = gender;
    }

    if (category) {
      whereClause.category = category;
    }

    const athletes = await this.prisma.athlete.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        club: true,
        category: true,
        gender: true,
        personalBests: true,
        seasonBests: true,
      },
    });

    // Filtruj zawodników którzy mają wynik w danej konkurencji
    const athletesWithRecords = athletes
      .map((athlete) => {
        const personalBests = (athlete.personalBests as any) || {};
        const seasonBests = (athlete.seasonBests as any) || {};

        const record =
          sortBy === 'PB' ? personalBests[eventName] : seasonBests[eventName];

        if (!record) return null;

        return {
          ...athlete,
          record,
          recordType: sortBy,
        };
      })
      .filter((athlete) => athlete !== null);

    // Sortuj według wyników
    const isTimeEvent = this.isTimeBasedEvent(eventName);

    athletesWithRecords.sort((a, b) => {
      if (isTimeEvent) {
        // Dla biegów - sortuj rosnąco (najszybszy pierwszy)
        return (
          this.parseTimeToSeconds(a.record.result) -
          this.parseTimeToSeconds(b.record.result)
        );
      } else {
        // Dla skoków i rzutów - sortuj malejąco (najdalej/najwyżej pierwszy)
        return parseFloat(b.record.result) - parseFloat(a.record.result);
      }
    });

    return athletesWithRecords.slice(0, limit);
  }

  /**
   * Czyści rekordy sezonu na początku nowego roku
   */
  async clearSeasonBests(year?: number) {
    const targetYear = year || new Date().getFullYear();

    // Znajdź wszystkich zawodników
    const athletes = await this.prisma.athlete.findMany({
      select: {
        id: true,
        seasonBests: true,
      },
    });

    // Filtruj tych którzy mają SB
    const athletesWithSB = athletes.filter(
      (athlete) => athlete.seasonBests !== null,
    );

    let clearedCount = 0;

    for (const athlete of athletesWithSB) {
      const seasonBests = (athlete.seasonBests as any) || {};
      let hasOldRecords = false;

      // Sprawdź czy są rekordy z poprzednich lat
      for (const eventName in seasonBests) {
        const record = seasonBests[eventName];
        const recordYear = new Date(record.date).getFullYear();

        if (recordYear < targetYear) {
          delete seasonBests[eventName];
          hasOldRecords = true;
        }
      }

      // Aktualizuj zawodnika jeśli były stare rekordy
      if (hasOldRecords) {
        await this.prisma.athlete.update({
          where: { id: athlete.id },
          data: {
            seasonBests:
              Object.keys(seasonBests).length > 0 ? seasonBests : null,
          },
        });
        clearedCount++;
      }
    }

    return {
      message: `Cleared season bests for ${clearedCount} athletes`,
      year: targetYear,
      clearedAthletes: clearedCount,
    };
  }
}
