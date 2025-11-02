import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

export interface PzlaResult {
  event: string;
  result: string;
  date: string;
  competition: string;
  location?: string;
  wind?: string;
  isPersonalBest?: boolean;
  isSeasonBest?: boolean;
}

export interface PzlaAthleteData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  club?: string;
  licenseNumber?: string;
  results: PzlaResult[];
}

@Injectable()
export class PzlaIntegrationService {
  private readonly logger = new Logger(PzlaIntegrationService.name);
  private readonly PZLA_BASE_URL = 'https://statystyka.pzla.pl';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Opóźnienie między requestami
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Wyszukuje zawodnika na stronie PZLA po numerze licencji
   */
  async searchAthleteByLicense(
    licenseNumber: string,
  ): Promise<PzlaAthleteData | null> {
    // Tryb mock dla testów
    if (process.env.PZLA_MOCK_MODE === 'true') {
      return this.getMockAthleteData(licenseNumber);
    }

    try {
      this.logger.log(`Searching for athlete with license: ${licenseNumber}`);

      // Wyszukiwanie po numerze licencji na stronie PZLA
      const searchUrl = `${this.PZLA_BASE_URL}/baza/`;

      // Najpierw pobierz stronę wyszukiwania
      const searchPageResponse = await firstValueFrom(
        this.httpService.get(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(searchPageResponse.data);

      // Sprawdź czy jest formularz wyszukiwania
      const searchForm = $('form').first();
      if (searchForm.length === 0) {
        this.logger.warn('No search form found on PZLA page');
        return null;
      }

      // Przygotuj dane do wyszukiwania - PZLA może używać różnych nazw pól
      const formData = new URLSearchParams();

      // Spróbuj różne możliwe nazwy pól dla numeru licencji
      const possibleLicenseFields = [
        'licencja',
        'license',
        'nr_licencji',
        'license_number',
      ];
      let licenseFieldFound = false;

      for (const fieldName of possibleLicenseFields) {
        if ($(`input[name="${fieldName}"]`).length > 0) {
          formData.append(fieldName, licenseNumber);
          licenseFieldFound = true;
          break;
        }
      }

      if (!licenseFieldFound) {
        // Jeśli nie ma pola licencji, spróbuj wyszukać jako nazwisko
        formData.append('nazwisko', licenseNumber);
      }

      // Znajdź wszystkie ukryte pola formularza
      $('input[type="hidden"]').each((_, element) => {
        const name = $(element).attr('name');
        const value = $(element).attr('value');
        if (name && value) {
          formData.append(name, value);
        }
      });

      await this.delay(1000); // Opóźnienie między requestami

      // Wyślij formularz wyszukiwania
      const searchResponse = await firstValueFrom(
        this.httpService.post(searchUrl, formData.toString(), {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            Referer: searchUrl,
          },
          timeout: 10000,
        }),
      );

      // Parsuj wyniki wyszukiwania
      return await this.parseSearchResults(searchResponse.data, licenseNumber);
    } catch (error) {
      this.logger.error(
        `Error searching athlete by license ${licenseNumber}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Wyszukuje zawodnika po imieniu, nazwisku i dacie urodzenia
   */
  async searchAthleteByName(
    firstName: string,
    lastName: string,
    dateOfBirth?: Date,
  ): Promise<PzlaAthleteData | null> {
    // Tryb mock dla testów
    if (process.env.PZLA_MOCK_MODE === 'true') {
      return this.getMockAthleteDataByName(firstName, lastName);
    }

    try {
      this.logger.log(`Searching for athlete: ${firstName} ${lastName}`);

      // Wyszukiwanie po nazwisku i imieniu na stronie PZLA
      const searchUrl = `${this.PZLA_BASE_URL}/baza/`;

      // Najpierw pobierz stronę wyszukiwania
      const searchPageResponse = await firstValueFrom(
        this.httpService.get(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(searchPageResponse.data);

      // Przygotuj dane do wyszukiwania
      const formData = new URLSearchParams();

      // Dodaj nazwisko i imię - spróbuj różne możliwe nazwy pól
      const possibleLastNameFields = ['nazwisko', 'lastname', 'surname'];
      const possibleFirstNameFields = ['imie', 'firstname', 'name'];

      for (const fieldName of possibleLastNameFields) {
        if ($(`input[name="${fieldName}"]`).length > 0) {
          formData.append(fieldName, lastName);
          break;
        }
      }

      for (const fieldName of possibleFirstNameFields) {
        if ($(`input[name="${fieldName}"]`).length > 0) {
          formData.append(fieldName, firstName);
          break;
        }
      }

      // Jeśli nie znaleziono specjalnych pól, użyj ogólnego pola wyszukiwania
      if (
        !formData.has('nazwisko') &&
        !formData.has('lastname') &&
        !formData.has('surname')
      ) {
        // Spróbuj znaleźć ogólne pole wyszukiwania
        const searchField = $('input[type="text"]').first();
        if (searchField.length > 0) {
          const fieldName = searchField.attr('name') || 'search';
          formData.append(fieldName, `${firstName} ${lastName}`);
        }
      }

      // Znajdź wszystkie ukryte pola formularza
      $('input[type="hidden"]').each((_, element) => {
        const name = $(element).attr('name');
        const value = $(element).attr('value');
        if (name && value) {
          formData.append(name, value);
        }
      });

      await this.delay(1000); // Opóźnienie między requestami

      // Wyślij formularz wyszukiwania
      const searchResponse = await firstValueFrom(
        this.httpService.post(searchUrl, formData.toString(), {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            Referer: searchUrl,
          },
          timeout: 10000,
        }),
      );

      // Parsuj wyniki wyszukiwania
      const results = await this.parseSearchResults(
        searchResponse.data,
        `${firstName} ${lastName}`,
      );

      // Jeśli mamy datę urodzenia, spróbuj znaleźć najlepsze dopasowanie
      if (results && dateOfBirth) {
        return this.findBestMatch(results, firstName, lastName, dateOfBirth);
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Error searching athlete ${firstName} ${lastName}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Parsuje wyniki wyszukiwania ze strony PZLA
   */
  private async parseSearchResults(
    html: string,
    searchTerm: string,
  ): Promise<PzlaAthleteData | null> {
    try {
      const $ = cheerio.load(html);

      // Szukaj linków do profili zawodników
      const athleteLinks = $('a[href*="personal.php"]');

      if (athleteLinks.length === 0) {
        this.logger.debug(`No athlete profiles found for: ${searchTerm}`);
        return null;
      }

      // Weź pierwszy wynik (najlepsze dopasowanie)
      const firstLink = athleteLinks.first();
      const athleteUrl = firstLink.attr('href');
      const athleteName = firstLink.text().trim();

      if (!athleteUrl || !athleteName) {
        this.logger.debug(`Invalid athlete link found for: ${searchTerm}`);
        return null;
      }

      // Wyodrębnij imię i nazwisko
      const nameParts = athleteName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Pobierz szczegóły zawodnika
      return await this.fetchAthleteDetails(athleteUrl, firstName, lastName);
    } catch (error) {
      this.logger.error(
        `Error parsing search results for ${searchTerm}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Pobiera szczegóły zawodnika z jego profilu
   */
  private async fetchAthleteDetails(
    athleteUrl: string,
    firstName: string,
    lastName: string,
  ): Promise<PzlaAthleteData | null> {
    try {
      // Upewnij się, że URL jest pełny
      const fullUrl = athleteUrl.startsWith('http')
        ? athleteUrl
        : `${this.PZLA_BASE_URL}${athleteUrl}`;

      await this.delay(1000); // Opóźnienie między requestami

      const response = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(response.data);

      // Wyodrębnij podstawowe informacje o zawodniku
      let club = '';
      let licenseNumber = '';

      // Szukaj informacji o klubie i licencji w różnych miejscach
      $('td, div, span').each((_, element) => {
        const text = $(element).text().trim();

        // Szukaj klubu
        if (text.includes('Klub:') || text.includes('Club:')) {
          club = text.replace(/Klub:|Club:/, '').trim();
        }

        // Szukaj numeru licencji
        if (text.includes('Licencja:') || text.includes('License:')) {
          licenseNumber = text.replace(/Licencja:|License:/, '').trim();
        }
      });

      // Pobierz wyniki zawodnika
      const results = await this.fetchAthleteResults(fullUrl);

      return {
        firstName,
        lastName,
        club: club || undefined,
        licenseNumber: licenseNumber || undefined,
        results,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching athlete details from ${athleteUrl}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Znajduje najlepsze dopasowanie zawodnika na podstawie daty urodzenia
   */
  private findBestMatch(
    athleteData: PzlaAthleteData,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
  ): PzlaAthleteData | null {
    // Dla uproszczenia, zwracamy pierwsze dopasowanie
    // W rzeczywistej implementacji można by porównywać daty urodzenia
    // jeśli są dostępne w profilu zawodnika

    const nameMatch =
      athleteData.firstName.toLowerCase().includes(firstName.toLowerCase()) &&
      athleteData.lastName.toLowerCase().includes(lastName.toLowerCase());

    if (nameMatch) {
      return athleteData;
    }

    return null;
  }

  /**
   * Pobiera wyniki zawodnika z PZLA i parsuje je
   */
  async fetchAthleteResults(athleteUrl: string): Promise<PzlaResult[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(athleteUrl, {
          timeout: 10000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        }),
      );

      const $ = cheerio.load(response.data);
      const results: PzlaResult[] = [];

      // Parsowanie tabeli wyników - PZLA może mieć różne struktury tabel
      // Szukamy wszystkich tabel na stronie
      $('table').each((tableIndex, table) => {
        const $table = $(table);

        // Sprawdź czy tabela zawiera wyniki (szukaj nagłówków typowych dla wyników)
        const headers = $table.find('tr').first().find('th, td');
        let isResultsTable = false;

        headers.each((_, header) => {
          const headerText = $(header).text().toLowerCase();
          if (
            headerText.includes('konkurencja') ||
            headerText.includes('wynik') ||
            headerText.includes('data') ||
            headerText.includes('event') ||
            headerText.includes('result')
          ) {
            isResultsTable = true;
          }
        });

        if (!isResultsTable) return;

        // Parsuj wiersze tabeli
        $table.find('tr').each((rowIndex, row) => {
          if (rowIndex === 0) return; // Pomiń nagłówek

          const cells = $(row).find('td');
          if (cells.length < 3) return; // Musi mieć przynajmniej 3 kolumny

          // Spróbuj różne układy kolumn
          let event = '';
          let result = '';
          let date = '';
          let competition = '';
          let wind = '';

          // Wariant 1: Konkurencja, Wynik, Data, Zawody, Wiatr
          if (cells.length >= 4) {
            event = $(cells[0]).text().trim();
            result = $(cells[1]).text().trim();
            date = $(cells[2]).text().trim();
            competition = $(cells[3]).text().trim();
            wind = $(cells[4])?.text().trim() || '';
          }
          // Wariant 2: Wynik, Konkurencja, Data, Zawody
          else if (cells.length >= 3) {
            result = $(cells[0]).text().trim();
            event = $(cells[1]).text().trim();
            date = $(cells[2]).text().trim();
            competition = $(cells[3])?.text().trim() || '';
          }

          // Walidacja danych
          if (event && result && date) {
            // Sprawdź czy wynik wygląda na prawidłowy (zawiera cyfry)
            if (/\d/.test(result)) {
              results.push({
                event: this.normalizeEventName(event),
                result: this.normalizeResult(result),
                date: this.normalizeDate(date),
                competition: competition || 'Nieznane zawody',
                wind: wind || undefined,
              });
            }
          }
        });
      });

      // Jeśli nie znaleziono wyników w tabelach, spróbuj innych selektorów
      if (results.length === 0) {
        // Szukaj wyników w divach lub innych elementach
        $('.result-row, .wynik, .record').each((_, element) => {
          const text = $(element).text().trim();
          // Spróbuj wyodrębnić wynik z tekstu
          const match = text.match(
            /(\w+)\s+([0-9:.,]+)\s+(\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4})/,
          );
          if (match) {
            results.push({
              event: this.normalizeEventName(match[1]),
              result: this.normalizeResult(match[2]),
              date: this.normalizeDate(match[3]),
              competition: 'Nieznane zawody',
            });
          }
        });
      }

      this.logger.debug(`Found ${results.length} results for athlete`);
      return results;
    } catch (error) {
      this.logger.error(`Error fetching results from ${athleteUrl}:`, error);
      return [];
    }
  }

  /**
   * Aktualizuje rekordy zawodnika na podstawie danych z PZLA
   */
  async updateAthleteRecordsFromPzla(athleteId: string): Promise<{
    updated: boolean;
    personalBests: any;
    seasonBests: any;
    errors: string[];
  }> {
    try {
      const athlete = await this.prisma.athlete.findUnique({
        where: { id: athleteId },
      });

      if (!athlete) {
        return {
          updated: false,
          personalBests: null,
          seasonBests: null,
          errors: ['Athlete not found'],
        };
      }

      let pzlaData: PzlaAthleteData | null = null;

      // Próbuj wyszukać po numerze licencji
      if (athlete.licenseNumber) {
        pzlaData = await this.searchAthleteByLicense(athlete.licenseNumber);
      }

      // Jeśli nie znaleziono po licencji, spróbuj po nazwisku
      if (!pzlaData) {
        pzlaData = await this.searchAthleteByName(
          athlete.firstName,
          athlete.lastName,
          athlete.dateOfBirth,
        );
      }

      if (!pzlaData || pzlaData.results.length === 0) {
        return {
          updated: false,
          personalBests: athlete.personalBests,
          seasonBests: athlete.seasonBests,
          errors: ['No data found on PZLA website'],
        };
      }

      // Przetwórz wyniki z PZLA
      const { personalBests, seasonBests } = this.processPzlaResults(
        pzlaData.results,
        athlete.personalBests as any,
        athlete.seasonBests as any,
      );

      // Aktualizuj zawodnika w bazie
      const updatedAthlete = await this.prisma.athlete.update({
        where: { id: athleteId },
        data: {
          personalBests,
          seasonBests,
          // Aktualizuj numer licencji jeśli go nie było
          licenseNumber: athlete.licenseNumber || pzlaData.licenseNumber,
        },
      });

      this.logger.log(
        `Updated records for athlete ${athlete.firstName} ${athlete.lastName}`,
      );

      return {
        updated: true,
        personalBests: updatedAthlete.personalBests,
        seasonBests: updatedAthlete.seasonBests,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`Error updating athlete records from PZLA:`, error);
      return {
        updated: false,
        personalBests: null,
        seasonBests: null,
        errors: [error.message],
      };
    }
  }

  /**
   * Przetwarza wyniki z PZLA i łączy z istniejącymi rekordami
   */
  private processPzlaResults(
    pzlaResults: PzlaResult[],
    existingPB: any = {},
    existingSB: any = {},
  ): { personalBests: any; seasonBests: any } {
    const personalBests = { ...existingPB };
    const seasonBests = { ...existingSB };
    const currentYear = new Date().getFullYear();
    const lastQuarterDate = new Date();
    lastQuarterDate.setMonth(lastQuarterDate.getMonth() - 3);

    for (const result of pzlaResults) {
      const eventName = result.event;
      const resultDate = new Date(result.date);
      const isCurrentSeason = resultDate.getFullYear() === currentYear;
      const isLastQuarter = resultDate >= lastQuarterDate;

      // Aktualizuj Personal Best
      if (
        !personalBests[eventName] ||
        this.isBetterResult(
          result.result,
          personalBests[eventName].result,
          eventName,
        )
      ) {
        personalBests[eventName] = {
          result: result.result,
          date: result.date,
          competition: result.competition,
          wind: result.wind,
        };
      }

      // Aktualizuj Season Best (bieżący sezon lub ostatni kwartał)
      if (isCurrentSeason || isLastQuarter) {
        if (
          !seasonBests[eventName] ||
          this.isBetterResult(
            result.result,
            seasonBests[eventName].result,
            eventName,
          )
        ) {
          seasonBests[eventName] = {
            result: result.result,
            date: result.date,
            competition: result.competition,
            wind: result.wind,
          };
        }
      }
    }

    return { personalBests, seasonBests };
  }

  /**
   * Sprawdza czy wynik jest lepszy od istniejącego
   */
  private isBetterResult(
    newResult: string,
    existingResult: string,
    eventName: string,
  ): boolean {
    const isTimeEvent = this.isTimeBasedEvent(eventName);

    if (isTimeEvent) {
      // Dla biegów - mniejszy czas jest lepszy
      return (
        this.parseTimeToSeconds(newResult) <
        this.parseTimeToSeconds(existingResult)
      );
    } else {
      // Dla skoków i rzutów - większa wartość jest lepsza
      return parseFloat(newResult) > parseFloat(existingResult);
    }
  }

  /**
   * Sprawdza czy konkurencja jest oparta na czasie
   */
  private isTimeBasedEvent(eventName: string): boolean {
    const timeEvents = [
      '60M',
      '100M',
      '150M',
      '200M',
      '300M',
      '400M',
      '500M',
      '600M',
      '800M',
      '1000M',
      '1500M',
      '1600M',
      '2000M',
      '3000M',
      '5000M',
      '10000M',
      '60P',
      '80P',
      '100P',
      '110P',
      '300P',
      '400P',
      'MARATON',
      'PÓŁMARATON',
      'CHÓD',
    ];

    return timeEvents.some((event) => eventName.toUpperCase().includes(event));
  }

  /**
   * Parsuje czas do sekund
   */
  private parseTimeToSeconds(timeStr: string): number {
    if (!timeStr) return Infinity;

    // Usuń dodatkowe znaki
    const cleanTime = timeStr.replace(/[^\d:.,]/g, '').replace(',', '.');

    if (cleanTime.includes(':')) {
      // Format MM:SS.ss lub HH:MM:SS.ss
      const parts = cleanTime.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
      } else if (parts.length === 3) {
        return (
          parseInt(parts[0]) * 3600 +
          parseInt(parts[1]) * 60 +
          parseFloat(parts[2])
        );
      }
    }

    return parseFloat(cleanTime);
  }

  /**
   * Normalizuje datę do standardowego formatu
   */
  private normalizeDate(dateStr: string): string {
    if (!dateStr) return '';

    // Usuń dodatkowe białe znaki
    const cleanDate = dateStr.trim();

    // Spróbuj różne formaty dat
    // Format DD.MM.YYYY
    const ddmmyyyy = cleanDate.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Format YYYY-MM-DD (już standardowy)
    const yyyymmdd = cleanDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (yyyymmdd) {
      const [, year, month, day] = yyyymmdd;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Format DD/MM/YYYY
    const ddmmyyyySlash = cleanDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ddmmyyyySlash) {
      const [, day, month, year] = ddmmyyyySlash;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Jeśli nie można sparsować, zwróć oryginalną datę
    return cleanDate;
  }

  /**
   * Normalizuje nazwę konkurencji do standardowego formatu
   */
  private normalizeEventName(eventName: string): string {
    const normalized = eventName.toUpperCase().trim();

    // Mapowanie nazw konkurencji z PZLA na nasze standardy
    const eventMapping: { [key: string]: string } = {
      '100': '100M',
      '200': '200M',
      '400': '400M',
      '800': '800M',
      '1500': '1500M',
      '5000': '5000M',
      '10000': '10000M',
      WZWYŻ: 'WZWYŻ',
      'W DAL': 'W_DAL',
      TYCZKA: 'TYCZKA',
      TRÓJSKOK: 'TRÓJSKOK',
      KULA: 'KULA',
      DYSK: 'DYSK',
      MŁOT: 'MŁOT',
      OSZCZEP: 'OSZCZEP',
      '110P': '110P',
      '100P': '100P',
      '400P': '400P',
    };

    return eventMapping[normalized] || normalized;
  }

  /**
   * Normalizuje wynik do standardowego formatu
   */
  private normalizeResult(result: string): string {
    return result.trim().replace(',', '.');
  }

  /**
   * Pobiera wyniki dla wszystkich zawodników bez rekordów
   */
  async updateAllAthletesWithoutRecords(): Promise<{
    processed: number;
    updated: number;
    errors: string[];
  }> {
    const athletes = await this.prisma.athlete.findMany({
      where: {
        OR: [
          { personalBests: { equals: Prisma.JsonNull } },
          { seasonBests: { equals: Prisma.JsonNull } },
          { personalBests: {} },
          { seasonBests: {} },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        licenseNumber: true,
      },
    });

    let processed = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const athlete of athletes) {
      try {
        const result = await this.updateAthleteRecordsFromPzla(athlete.id);
        processed++;

        if (result.updated) {
          updated++;
          this.logger.log(
            `Updated records for ${athlete.firstName} ${athlete.lastName}`,
          );
        } else {
          errors.push(
            ...result.errors.map(
              (error) => `${athlete.firstName} ${athlete.lastName}: ${error}`,
            ),
          );
        }

        // Dodaj opóźnienie między requestami żeby nie przeciążyć serwera PZLA
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        processed++;
        errors.push(
          `${athlete.firstName} ${athlete.lastName}: ${error.message}`,
        );
      }
    }

    return { processed, updated, errors };
  }

  /**
   * Mock data dla testów - zwraca przykładowe dane zawodnika
   */
  private getMockAthleteData(licenseNumber: string): PzlaAthleteData | null {
    // Symuluj różne przypadki na podstawie numeru licencji
    if (licenseNumber === 'Z/0298/23') {
      return {
        firstName: 'Maja',
        lastName: 'GUZMAN',
        club: 'UMKS Iskra Wolsztyn',
        licenseNumber: 'Z/0298/23',
        results: [
          {
            event: '200M',
            result: '24.85',
            date: '2024-06-15',
            competition: 'Mistrzostwa Województwa Wielkopolskiego',
            location: 'Poznań',
            wind: '+0.8',
            isPersonalBest: true,
            isSeasonBest: true,
          },
          {
            event: '100M',
            result: '12.15',
            date: '2024-05-20',
            competition: 'Zawody Młodzieżowe',
            location: 'Wolsztyn',
            wind: '+1.2',
            isPersonalBest: false,
            isSeasonBest: true,
          },
          {
            event: '400M',
            result: '56.42',
            date: '2024-07-10',
            competition: 'Letnie Zawody Lekkoatletyczne',
            location: 'Leszno',
            isPersonalBest: true,
            isSeasonBest: true,
          },
          {
            event: 'W_DAL',
            result: '5.85',
            date: '2024-06-01',
            competition: 'Zawody Wielobojowe',
            location: 'Poznań',
            isPersonalBest: true,
            isSeasonBest: true,
          },
        ],
      };
    }

    // Dla innych numerów licencji zwróć null (nie znaleziono)
    return null;
  }

  /**
   * Mock data dla wyszukiwania po nazwisku
   */
  private getMockAthleteDataByName(
    firstName: string,
    lastName: string,
  ): PzlaAthleteData | null {
    // Symuluj wyszukiwanie Maja GUZMAN
    if (
      firstName.toLowerCase().includes('maja') &&
      lastName.toLowerCase().includes('guzman')
    ) {
      return this.getMockAthleteData('Z/0298/23');
    }

    // Dodaj więcej przypadków testowych
    if (
      firstName.toLowerCase().includes('cezary') &&
      lastName.toLowerCase().includes('bykowski')
    ) {
      return {
        firstName: 'Cezary',
        lastName: 'BYKOWSKI',
        club: 'Olimpia Osowa Gdańsk',
        licenseNumber: 'M/1234/11',
        results: [
          {
            event: '60M',
            result: '7.85',
            date: '2024-02-15',
            competition: 'Halowe Mistrzostwa Pomorza',
            location: 'Gdańsk',
            isPersonalBest: true,
            isSeasonBest: true,
          },
          {
            event: '100M',
            result: '11.95',
            date: '2024-06-20',
            competition: 'Mistrzostwa Województwa',
            location: 'Gdańsk',
            wind: '+0.5',
            isPersonalBest: true,
            isSeasonBest: true,
          },
        ],
      };
    }

    // Dla innych zawodników zwróć null
    return null;
  }
}
