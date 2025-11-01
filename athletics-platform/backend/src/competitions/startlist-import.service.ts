import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Category, Gender } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ImportStartListDto,
  ImportStartListResult,
  PZLAStartListRow,
  ParsedStartListEntry,
  RosterStartListRow,
  StartListFormat,
} from './dto/import-startlist.dto';

@Injectable()
export class StartListImportService {
  private readonly logger = new Logger(StartListImportService.name);

  constructor(private prisma: PrismaService) {}

  async importStartList(
    dto: ImportStartListDto,
  ): Promise<ImportStartListResult> {
    try {
      // Sprawdź czy zawody istnieją
      const competition = await this.prisma.competition.findUnique({
        where: { id: dto.competitionId },
        include: { events: true },
      });

      if (!competition) {
        throw new BadRequestException('Zawody nie zostały znalezione');
      }

      // Parsuj CSV
      const csvRows = this.parseCSV(dto.csvData);
      if (csvRows.length === 0) {
        throw new BadRequestException('Plik CSV jest pusty lub nieprawidłowy');
      }

      // Wykryj format automatycznie jeśli nie został podany
      const detectedFormat =
        dto.format === StartListFormat.AUTO
          ? this.detectFormat(csvRows[0])
          : dto.format || StartListFormat.PZLA;

      // Parsuj dane w zależności od formatu
      const parsedEntries = this.parseEntries(csvRows, detectedFormat);

      // Waliduj i importuj dane
      const result = await this.processImport(
        dto.competitionId,
        parsedEntries,
        competition,
      );

      return {
        success: true,
        message: `Pomyślnie zaimportowano ${result.importedCount} zawodników`,
        importedCount: result.importedCount,
        errors: result.errors,
        warnings: result.warnings,
        detectedFormat,
        entries: parsedEntries,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Błąd podczas importu',
        importedCount: 0,
        errors: [error.message],
        warnings: [],
        detectedFormat: dto.format || StartListFormat.PZLA,
        entries: [],
      };
    }
  }

  private parseCSV(csvData: string): Record<string, string>[] {
    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    // Wykryj separator (przecinek lub średnik)
    const separator = csvData.includes(';') ? ';' : ',';

    const headers = this.parseCSVLine(lines[0], separator);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue; // Pomiń puste linie

      const values = this.parseCSVLine(lines[i], separator);
      if (values.length >= headers.length - 2) {
        // Toleruj brakujące kolumny na końcu
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
    }

    return rows;
  }

  private parseCSVLine(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private detectFormat(firstRow: Record<string, string>): StartListFormat {
    // Sprawdź charakterystyczne kolumny dla każdego formatu
    const pzlaColumns = ['Nazwisko', 'Imię', 'DataUr', 'NazwaPZLA', 'Klub'];
    const rosterColumns = [
      'FirstName',
      'LastName',
      'DateOfBirth',
      'EventCode',
      'ClubName',
    ];

    const hasPZLAColumns = pzlaColumns.some((col) =>
      Object.prototype.hasOwnProperty.call(firstRow, col),
    );
    const hasRosterColumns = rosterColumns.some((col) =>
      Object.prototype.hasOwnProperty.call(firstRow, col),
    );

    if (hasPZLAColumns) return StartListFormat.PZLA;
    if (hasRosterColumns) return StartListFormat.ROSTER;

    return StartListFormat.PZLA; // Domyślnie PZLA
  }

  private parseEntries(
    rows: Record<string, string>[],
    format: StartListFormat,
  ): ParsedStartListEntry[] {
    return rows
      .map((row) => {
        if (format === StartListFormat.PZLA) {
          return this.parsePZLARow(row as unknown as PZLAStartListRow);
        } else {
          return this.parseRosterRow(row as unknown as RosterStartListRow);
        }
      })
      .filter((entry) => entry !== null);
  }

  private parsePZLARow(row: PZLAStartListRow): ParsedStartListEntry | null {
    try {
      // Sprawdź czy to jest wiersz z danymi zawodnika (nie nagłówek)
      const lastName = row.Nazwisko || row['Nazwisko'];
      const firstName = row['Imię'] || row['Imi�'] || row['Imie'];

      if (!lastName || !firstName || lastName === 'Nazwisko') {
        return null;
      }

      // Parsuj datę urodzenia
      let dateOfBirth = '';
      const birthDateField = row.DataUr || row['DataUr'];
      if (birthDateField) {
        // Format YYYY-MM-DD
        const dateMatch = birthDateField.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          dateOfBirth = birthDateField;
        }
      }

      // Określ płeć na podstawie nazwy konkurencji
      const eventName =
        row['Pełna nazwa'] || row['Pe�na nazwa'] || row.NazwaPZLA;
      const gender = this.determineGenderFromEventName(eventName);

      // Sprawdź czy to sztafeta
      const relayTeam = row.Sztafeta?.trim() || undefined;
      const relayPositionStr =
        row.skład?.trim() || row['sk�ad']?.trim() || undefined;
      const relayPosition = relayPositionStr
        ? parseInt(relayPositionStr, 10)
        : undefined;

      // Sprawdź czy nazwa konkurencji zawiera słowa wskazujące na sztafetę
      const isRelayByName =
        eventName &&
        (eventName.toLowerCase().includes('4x') ||
          eventName.toLowerCase().includes('4 x') ||
          eventName.toLowerCase().includes('sztafeta') ||
          eventName.toLowerCase().includes('relay'));

      const isRelay = !!(relayTeam && relayPosition) || isRelayByName;

      // Spróbuj wyciągnąć kategorię z nazwy konkurencji
      const categoryFromEvent = this.extractCategoryFromEventName(eventName);

      return {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        club: row.Klub?.trim() || undefined,
        licenseNumber: row['Licencja PZLA']?.trim() || undefined,
        nationality: 'POL', // Domyślnie Polska dla PZLA
        eventName: eventName,
        eventCode: row.NrKonkur,
        category: categoryFromEvent, // Kategoria wyciągnięta z nazwy konkurencji
        bibNumber: row.NrStart?.trim() || undefined,
        lane: row.Tor?.trim() || undefined,
        heat: row.Seria?.trim() || undefined,
        personalBest: row.PB?.trim() || undefined,
        seasonBest: row.SB?.trim() || undefined,
        relayTeam: relayTeam || (isRelayByName ? row.Klub?.trim() : undefined),
        relayPosition: relayPosition || (isRelayByName ? 1 : undefined), // Domyślna pozycja 1 dla sztafet
        isRelay,
        coach: row.Trener?.trim() || undefined,
        notes: row.OOM?.trim() || undefined,
      };
    } catch (error) {
      this.logger.error('Error parsing PZLA row:', error, row);
      return null;
    }
  }

  private parseRosterRow(row: RosterStartListRow): ParsedStartListEntry | null {
    try {
      if (!row.LastName || !row.FirstName || row.LastName === 'LastName') {
        return null;
      }

      // Parsuj datę urodzenia
      let dateOfBirth = '';
      if (row.DateOfBirth) {
        // Format YYYY-MM-DD
        const dateMatch = row.DateOfBirth.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          dateOfBirth = row.DateOfBirth;
        }
      }

      // Określ płeć
      const gender = row.Gender?.toUpperCase() === 'MALE' ? 'MALE' : 'FEMALE';

      return {
        firstName: row.FirstName.trim(),
        lastName: row.LastName.trim(),
        dateOfBirth,
        gender: gender,
        club: row.ClubName?.trim() || row.ShortClubName?.trim() || undefined,
        nationality: row.CountryCode?.trim() || undefined,
        eventName: row.PZLAEventCode || row.EventCode,
        eventCode: row.EventCode,
        category: row.AgeGroup,
        bibNumber: row.BibNumber?.trim() || undefined,
        lane: row.Lane?.trim() || undefined,
        personalBest: row.PersonalBest?.trim() || undefined,
        seasonBest: row.SeasonBest?.trim() || undefined,
        seedTime: row.SeedingResult?.trim() || undefined,
        notes:
          [row.NotesPublic, row.NotesInternal].filter(Boolean).join('; ') ||
          undefined,
      };
    } catch (error) {
      this.logger.error('Error parsing Roster row:', error, row);
      return null;
    }
  }

  private determineGenderFromEventName(eventName: string): 'MALE' | 'FEMALE' {
    if (!eventName) return 'MALE';

    const lowerName = eventName.toLowerCase();

    // Sprawdź charakterystyczne słowa dla kobiet
    if (
      lowerName.includes('kobiet') ||
      lowerName.includes('women') ||
      lowerName.includes('female') ||
      lowerName.includes('k4x') ||
      lowerName.includes('girls')
    ) {
      return 'FEMALE';
    }

    // Sprawdź charakterystyczne słowa dla mężczyzn
    if (
      lowerName.includes('mężczyzn') ||
      lowerName.includes('men') ||
      lowerName.includes('male') ||
      lowerName.includes('m4x') ||
      lowerName.includes('boys')
    ) {
      return 'MALE';
    }

    return 'MALE'; // Domyślnie mężczyźni
  }

  private async processImport(
    competitionId: string,
    entries: ParsedStartListEntry[],
    competition: any,
  ): Promise<{ importedCount: number; errors: string[]; warnings: string[] }> {
    let importedCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Podziel wpisy na zwykłe i sztafetowe
    const regularEntries = entries.filter((entry) => !entry.isRelay);
    const relayEntries = entries.filter((entry) => entry.isRelay);

    // Przetwórz zwykłe wpisy
    for (const entry of regularEntries) {
      try {
        const result = await this.processRegularEntry(
          competitionId,
          entry,
          competition,
        );
        if (result.success) {
          importedCount++;
        } else {
          warnings.push(result.message);
        }
      } catch (error) {
        errors.push(
          `Błąd dla ${entry.firstName} ${entry.lastName}: ${error.message}`,
        );
      }
    }

    // Przetwórz wpisy sztafetowe
    if (relayEntries.length > 0) {
      try {
        const relayResult = await this.processRelayEntries(
          competitionId,
          relayEntries,
          competition,
        );
        importedCount += relayResult.importedCount;
        errors.push(...relayResult.errors);
        warnings.push(...relayResult.warnings);
      } catch (error) {
        errors.push(`Błąd podczas przetwarzania sztafet: ${error.message}`);
      }
    }

    return { importedCount, errors, warnings };
  }

  private async processRegularEntry(
    competitionId: string,
    entry: ParsedStartListEntry,
    competition: any,
  ): Promise<{ success: boolean; message: string }> {
    // Znajdź lub utwórz zawodnika
    const athlete = await this.findOrCreateAthlete(entry);

    // Znajdź lub utwórz konkurencję
    const event = await this.findOrCreateEvent(competitionId, entry);

    // Sprawdź czy rejestracja już istnieje
    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        athleteId: athlete.id,
        competitionId: competitionId,
      },
    });

    let registration;
    if (existingRegistration) {
      registration = existingRegistration;
    } else {
      // Utwórz rejestrację
      registration = await this.prisma.registration.create({
        data: {
          athleteId: athlete.id,
          competitionId: competitionId,
          userId: competition.createdById, // Użyj ID twórcy zawodów
          status: 'CONFIRMED',
          bibNumber: entry.bibNumber,
          seedTime: entry.seedTime || entry.personalBest || entry.seasonBest,
          notes: entry.notes,
        },
      });
    }

    // Sprawdź czy zawodnik jest już zarejestrowany na tę konkurencję
    const existingEventRegistration =
      await this.prisma.registrationEvent.findFirst({
        where: {
          registrationId: registration.id,
          eventId: event.id,
        },
      });

    if (!existingEventRegistration) {
      // Dodaj rejestrację na konkurencję
      await this.prisma.registrationEvent.create({
        data: {
          registrationId: registration.id,
          eventId: event.id,
          seedTime: entry.seedTime || entry.personalBest || entry.seasonBest,
        },
      });
      return { success: true, message: 'Zaimportowano zawodnika' };
    } else {
      return {
        success: false,
        message: `Zawodnik ${entry.firstName} ${entry.lastName} już jest zarejestrowany na konkurencję ${entry.eventName}`,
      };
    }
  }

  private async processRelayEntries(
    competitionId: string,
    entries: ParsedStartListEntry[],
    competition: any,
  ): Promise<{ importedCount: number; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let importedCount = 0;

    // Grupuj wpisy według klubu i konkurencji
    const groupedEntries = this.groupRelayEntries(entries);

    for (const [clubName, eventGroups] of Object.entries(groupedEntries)) {
      for (const [eventName, athletes] of Object.entries(eventGroups)) {
        try {
          // Znajdź lub utwórz konkurencję
          const event = await this.findOrCreateEvent(
            competitionId,
            athletes[0],
          );

          // Podziel zawodników na zespoły (maksymalnie 6 zawodników na zespół)
          const teams = this.createRelayTeams(clubName, athletes);

          for (const [teamIndex, teamAthletes] of teams.entries()) {
            // Utwórz zespół sztafetowy
            const teamName =
              teams.length > 1
                ? `${clubName} ${this.numberToRoman(teamIndex + 1)}`
                : clubName;

            const relayTeam = await this.findOrCreateRelayTeam(
              competitionId,
              teamName,
              clubName,
              competition.createdById,
            );

            // Dodaj zawodników do zespołu
            for (const athleteEntry of teamAthletes) {
              const athlete = await this.findOrCreateAthlete(athleteEntry);
              const position = athleteEntry.relayPosition || 1;

              await this.addAthleteToRelayTeam(
                relayTeam.id,
                athlete.id,
                position,
                position > 4, // Pozycje 5-6 to rezerwowi
              );
            }

            // Zarejestruj zespół na konkurencję
            await this.registerRelayTeamForEvent(relayTeam.id, event.id);

            importedCount += teamAthletes.length;
          }
        } catch (error) {
          errors.push(
            `Błąd dla klubu ${clubName} w konkurencji ${eventName}: ${error.message}`,
          );
        }
      }
    }

    return { importedCount, errors, warnings };
  }

  private groupRelayEntries(
    entries: ParsedStartListEntry[],
  ): Record<string, Record<string, ParsedStartListEntry[]>> {
    const grouped: Record<string, Record<string, ParsedStartListEntry[]>> = {};

    for (const entry of entries) {
      const clubName = entry.club || 'Nieznany klub';
      const eventName = entry.eventName;

      if (!grouped[clubName]) {
        grouped[clubName] = {};
      }
      if (!grouped[clubName][eventName]) {
        grouped[clubName][eventName] = [];
      }

      grouped[clubName][eventName].push(entry);
    }

    // Sortuj zawodników w każdym zespole według pozycji i przypisz pozycje jeśli brakuje
    for (const club of Object.values(grouped)) {
      for (const athletes of Object.values(club)) {
        // Sortuj według pozycji (jeśli są) lub według kolejności w pliku
        athletes.sort(
          (a, b) => (a.relayPosition || 999) - (b.relayPosition || 999),
        );

        // Przypisz pozycje jeśli brakuje
        athletes.forEach((athlete, index) => {
          if (!athlete.relayPosition) {
            athlete.relayPosition = index + 1;
          }
        });
      }
    }

    return grouped;
  }

  private createRelayTeams(
    clubName: string,
    athletes: ParsedStartListEntry[],
  ): ParsedStartListEntry[][] {
    const teams: ParsedStartListEntry[][] = [];
    const maxTeamSize = 6;

    for (let i = 0; i < athletes.length; i += maxTeamSize) {
      const teamAthletes = athletes.slice(i, i + maxTeamSize);

      // Resetuj pozycje dla każdego zespołu (1-6)
      teamAthletes.forEach((athlete, index) => {
        athlete.relayPosition = index + 1;
      });

      teams.push(teamAthletes);
    }

    return teams;
  }

  private async findOrCreateRelayTeam(
    competitionId: string,
    teamName: string,
    clubName: string,
    createdById: string,
  ) {
    // Sprawdź czy zespół już istnieje
    const existingTeam = await this.prisma.relayTeam.findFirst({
      where: {
        name: teamName,
        competitionId: competitionId,
      },
    });

    if (existingTeam) {
      return existingTeam;
    }

    // Utwórz nowy zespół
    return await this.prisma.relayTeam.create({
      data: {
        name: teamName,
        club: clubName,
        competitionId: competitionId,
        createdById: createdById,
      },
    });
  }

  private async addAthleteToRelayTeam(
    teamId: string,
    athleteId: string,
    position: number,
    isReserve: boolean,
  ) {
    // Sprawdź czy zawodnik już jest w zespole
    const existingMember = await this.prisma.relayTeamMember.findFirst({
      where: {
        teamId: teamId,
        athleteId: athleteId,
      },
    });

    if (existingMember) {
      return existingMember;
    }

    // Sprawdź czy pozycja jest już zajęta
    const existingPosition = await this.prisma.relayTeamMember.findFirst({
      where: {
        teamId: teamId,
        position: position,
      },
    });

    if (existingPosition) {
      // Znajdź pierwszą wolną pozycję
      const existingPositions = await this.prisma.relayTeamMember.findMany({
        where: { teamId: teamId },
        select: { position: true },
      });

      const usedPositions = existingPositions.map((p) => p.position);
      let newPosition = 1;
      while (usedPositions.includes(newPosition)) {
        newPosition++;
      }

      position = newPosition;
      isReserve = newPosition > 4;
    }

    // Dodaj zawodnika do zespołu
    return await this.prisma.relayTeamMember.create({
      data: {
        teamId: teamId,
        athleteId: athleteId,
        position: position,
        isReserve: isReserve,
      },
    });
  }

  private async registerRelayTeamForEvent(teamId: string, eventId: string) {
    // Sprawdź czy zespół już jest zarejestrowany na konkurencję
    const existingRegistration =
      await this.prisma.relayTeamRegistration.findFirst({
        where: {
          teamId: teamId,
          eventId: eventId,
        },
      });

    if (existingRegistration) {
      return existingRegistration;
    }

    // Zarejestruj zespół na konkurencję
    return await this.prisma.relayTeamRegistration.create({
      data: {
        teamId: teamId,
        eventId: eventId,
      },
    });
  }

  private numberToRoman(num: number): string {
    const romanNumerals = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
    ];
    return romanNumerals[num - 1] || num.toString();
  }

  private async findOrCreateAthlete(entry: ParsedStartListEntry) {
    // Najpierw spróbuj znaleźć po numerze licencji
    if (entry.licenseNumber) {
      const existingByLicense = await this.prisma.athlete.findUnique({
        where: { licenseNumber: entry.licenseNumber },
      });
      if (existingByLicense) return existingByLicense;
    }

    // Następnie spróbuj znaleźć po imieniu, nazwisku i dacie urodzenia
    const existingByName = await this.prisma.athlete.findFirst({
      where: {
        firstName: entry.firstName,
        lastName: entry.lastName,
        dateOfBirth: entry.dateOfBirth
          ? new Date(entry.dateOfBirth)
          : undefined,
      },
    });

    if (existingByName) return existingByName;

    // Utwórz nowego zawodnika
    return await this.prisma.athlete.create({
      data: {
        firstName: entry.firstName,
        lastName: entry.lastName,
        dateOfBirth: entry.dateOfBirth
          ? new Date(entry.dateOfBirth)
          : new Date(),
        gender: entry.gender as Gender,
        club: entry.club,
        licenseNumber: entry.licenseNumber,
        nationality: entry.nationality,
        category: this.determineCategoryFromAge(entry.dateOfBirth),
      },
    });
  }

  private async findOrCreateEvent(
    competitionId: string,
    entry: ParsedStartListEntry,
  ) {
    // Określ kategorię na podstawie daty urodzenia jeśli nie ma kategorii w danych
    const category = entry.category
      ? this.mapCategory(entry.category)
      : this.determineCategoryFromAge(entry.dateOfBirth);

    // Spróbuj znaleźć istniejącą konkurencję
    const existing = await this.prisma.event.findFirst({
      where: {
        competitionId,
        name: entry.eventName,
        gender: entry.gender as Gender,
        category: category,
      },
    });

    if (existing) return existing;

    // Utwórz nową konkurencję
    return await this.prisma.event.create({
      data: {
        name: entry.eventName,
        competitionId,
        type: this.determineEventType(entry.eventName),
        gender: entry.gender as Gender,
        category: category,
        unit: this.determineUnit(entry.eventName),
      },
    });
  }

  private determineCategoryFromAge(dateOfBirth: string): Category {
    if (!dateOfBirth) return Category.SENIOR;

    const birthDate = new Date(dateOfBirth);
    const currentYear = new Date().getFullYear();
    const birthYear = birthDate.getFullYear();
    const age = currentYear - birthYear;

    // Mapowanie wieku na kategorie
    if (age <= 8) return Category.U8;
    if (age <= 9) return Category.U9;
    if (age <= 10) return Category.U10;
    if (age <= 11) return Category.U11;
    if (age <= 12) return Category.U12;
    if (age <= 13) return Category.U13;
    if (age <= 14) return Category.U14;
    if (age <= 15) return Category.U15;
    if (age <= 16) return Category.U16;
    if (age <= 18) return Category.U18;
    if (age <= 20) return Category.U20;
    if (age <= 23) return Category.U23;

    // Kategorie Masters
    if (age >= 35 && age < 40) return Category.M35;
    if (age >= 40 && age < 45) return Category.M40;
    if (age >= 45 && age < 50) return Category.M45;
    if (age >= 50 && age < 55) return Category.M50;
    if (age >= 55 && age < 60) return Category.M55;
    if (age >= 60 && age < 65) return Category.M60;
    if (age >= 65 && age < 70) return Category.M65;
    if (age >= 70 && age < 75) return Category.M70;
    if (age >= 75 && age < 80) return Category.M75;
    if (age >= 80 && age < 85) return Category.M80;
    if (age >= 85 && age < 90) return Category.M85;
    if (age >= 90 && age < 95) return Category.M90;
    if (age >= 95 && age < 100) return Category.M95;
    if (age >= 100) return Category.M100;

    return Category.SENIOR;
  }

  private mapCategory(category: string): Category {
    if (!category) return Category.SENIOR;

    const categoryUpper = category.toUpperCase().trim();

    const categoryMap: { [key: string]: Category } = {
      // Kategorie liczbowe
      '8': Category.AGE_8,
      '9': Category.AGE_9,
      '10': Category.AGE_10,
      '11': Category.AGE_11,
      '12': Category.AGE_12,
      '13': Category.AGE_13,
      '14': Category.AGE_14,
      '15': Category.AGE_15,
      '16': Category.AGE_16,
      '17': Category.AGE_17,
      '18': Category.AGE_18,

      // Kategorie U (Under)
      U8: Category.U8,
      U9: Category.U9,
      U10: Category.U10,
      U11: Category.U11,
      U12: Category.U12,
      U13: Category.U13,
      U14: Category.U14,
      U15: Category.U15,
      U16: Category.U16,
      U18: Category.U18,
      U20: Category.U20,
      U23: Category.U23,

      // Kategorie Masters
      M35: Category.M35,
      M40: Category.M40,
      M45: Category.M45,
      M50: Category.M50,
      M55: Category.M55,
      M60: Category.M60,
      M65: Category.M65,
      M70: Category.M70,
      M75: Category.M75,
      M80: Category.M80,
      M85: Category.M85,
      M90: Category.M90,
      M95: Category.M95,
      M100: Category.M100,

      // Senior
      SENIOR: Category.SENIOR,
      SEN: Category.SENIOR,
    };

    return categoryMap[categoryUpper] || Category.SENIOR;
  }

  private extractCategoryFromEventName(eventName: string): string | undefined {
    if (!eventName) return undefined;

    const name = eventName.toLowerCase();

    // Szukaj kategorii w nazwie konkurencji
    const categoryPatterns = [
      /\bu18\b/i,
      /\bu20\b/i,
      /\bu16\b/i,
      /\bu15\b/i,
      /\bu14\b/i,
      /\bu13\b/i,
      /\bu12\b/i,
      /\bu11\b/i,
      /\bu10\b/i,
      /\bu9\b/i,
      /\bu8\b/i,
      /\bm35\b/i,
      /\bm40\b/i,
      /\bm45\b/i,
      /\bm50\b/i,
      /\bm55\b/i,
      /\bm60\b/i,
      /\bm65\b/i,
      /\bm70\b/i,
      /\bm75\b/i,
      /\bm80\b/i,
      /\bm85\b/i,
      /\bm90\b/i,
      /\bm95\b/i,
      /\bm100\b/i,
      /\bsenior\b/i,
      /\bsen\b/i,
    ];

    for (const pattern of categoryPatterns) {
      const match = eventName.match(pattern);
      if (match) {
        return match[0].toUpperCase();
      }
    }

    return undefined;
  }

  private determineEventType(eventName: string) {
    const lowerName = eventName.toLowerCase();

    // Sztafety (RELAY)
    if (
      lowerName.includes('4x') ||
      lowerName.includes('4 x') ||
      lowerName.includes('sztafeta') ||
      lowerName.includes('relay')
    ) {
      return 'RELAY';
    }

    // Konkurencje techniczne (FIELD)
    if (
      lowerName.includes('skok') ||
      lowerName.includes('rzut') ||
      lowerName.includes('jump') ||
      lowerName.includes('throw') ||
      lowerName.includes('pchnięcie') ||
      lowerName.includes('shot') ||
      lowerName.includes('dysk') ||
      lowerName.includes('disk') ||
      lowerName.includes('młot') ||
      lowerName.includes('hammer') ||
      lowerName.includes('oszczep') ||
      lowerName.includes('javelin') ||
      lowerName.includes('kula') ||
      lowerName.includes('put') ||
      lowerName.includes('wzwyż') ||
      lowerName.includes('high') ||
      lowerName.includes('dal') ||
      lowerName.includes('long') ||
      lowerName.includes('tyczka') ||
      lowerName.includes('pole')
    ) {
      return 'FIELD';
    }

    // Wieloboje (COMBINED)
    if (
      lowerName.includes('wielobój') ||
      lowerName.includes('combined') ||
      lowerName.includes('decathlon') ||
      lowerName.includes('heptathlon') ||
      lowerName.includes('pentathlon') ||
      lowerName.includes('10-bój') ||
      lowerName.includes('7-bój') ||
      lowerName.includes('5-bój')
    ) {
      return 'COMBINED';
    }

    // Biegi uliczne (ROAD)
    if (
      lowerName.includes('maraton') ||
      lowerName.includes('marathon') ||
      lowerName.includes('półmaraton') ||
      lowerName.includes('half') ||
      (lowerName.includes('km') && !lowerName.includes('m '))
    ) {
      return 'ROAD';
    }

    // Domyślnie biegi na bieżni (TRACK)
    return 'TRACK';
  }

  private determineUnit(eventName: string) {
    const lowerName = eventName.toLowerCase();

    // Konkurencje na wysokość
    if (
      lowerName.includes('wzwyż') ||
      lowerName.includes('high') ||
      lowerName.includes('tyczka') ||
      lowerName.includes('pole')
    ) {
      return 'HEIGHT';
    }

    // Konkurencje na odległość
    if (
      lowerName.includes('skok') ||
      lowerName.includes('rzut') ||
      lowerName.includes('jump') ||
      lowerName.includes('throw') ||
      lowerName.includes('pchnięcie') ||
      lowerName.includes('shot') ||
      lowerName.includes('dysk') ||
      lowerName.includes('disk') ||
      lowerName.includes('młot') ||
      lowerName.includes('hammer') ||
      lowerName.includes('oszczep') ||
      lowerName.includes('javelin') ||
      lowerName.includes('kula') ||
      lowerName.includes('put') ||
      lowerName.includes('dal') ||
      lowerName.includes('long')
    ) {
      return 'DISTANCE';
    }

    // Wieloboje - punkty
    if (
      lowerName.includes('wielobój') ||
      lowerName.includes('combined') ||
      lowerName.includes('decathlon') ||
      lowerName.includes('heptathlon') ||
      lowerName.includes('pentathlon') ||
      lowerName.includes('10-bój') ||
      lowerName.includes('7-bój') ||
      lowerName.includes('5-bój')
    ) {
      return 'POINTS';
    }

    // Domyślnie czas
    return 'TIME';
  }
}
