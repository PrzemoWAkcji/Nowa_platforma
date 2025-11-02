"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PzlaIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PzlaIntegrationService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const cheerio = require("cheerio");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma/prisma.service");
let PzlaIntegrationService = PzlaIntegrationService_1 = class PzlaIntegrationService {
    httpService;
    prisma;
    logger = new common_1.Logger(PzlaIntegrationService_1.name);
    PZLA_BASE_URL = 'https://statystyka.pzla.pl';
    constructor(httpService, prisma) {
        this.httpService = httpService;
        this.prisma = prisma;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async searchAthleteByLicense(licenseNumber) {
        if (process.env.PZLA_MOCK_MODE === 'true') {
            return this.getMockAthleteData(licenseNumber);
        }
        try {
            this.logger.log(`Searching for athlete with license: ${licenseNumber}`);
            const searchUrl = `${this.PZLA_BASE_URL}/baza/`;
            const searchPageResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
                timeout: 10000,
            }));
            const $ = cheerio.load(searchPageResponse.data);
            const searchForm = $('form').first();
            if (searchForm.length === 0) {
                this.logger.warn('No search form found on PZLA page');
                return null;
            }
            const formData = new URLSearchParams();
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
                formData.append('nazwisko', licenseNumber);
            }
            $('input[type="hidden"]').each((_, element) => {
                const name = $(element).attr('name');
                const value = $(element).attr('value');
                if (name && value) {
                    formData.append(name, value);
                }
            });
            await this.delay(1000);
            const searchResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post(searchUrl, formData.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Referer: searchUrl,
                },
                timeout: 10000,
            }));
            return await this.parseSearchResults(searchResponse.data, licenseNumber);
        }
        catch (error) {
            this.logger.error(`Error searching athlete by license ${licenseNumber}:`, error);
            return null;
        }
    }
    async searchAthleteByName(firstName, lastName, dateOfBirth) {
        if (process.env.PZLA_MOCK_MODE === 'true') {
            return this.getMockAthleteDataByName(firstName, lastName);
        }
        try {
            this.logger.log(`Searching for athlete: ${firstName} ${lastName}`);
            const searchUrl = `${this.PZLA_BASE_URL}/baza/`;
            const searchPageResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
                timeout: 10000,
            }));
            const $ = cheerio.load(searchPageResponse.data);
            const formData = new URLSearchParams();
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
            if (!formData.has('nazwisko') &&
                !formData.has('lastname') &&
                !formData.has('surname')) {
                const searchField = $('input[type="text"]').first();
                if (searchField.length > 0) {
                    const fieldName = searchField.attr('name') || 'search';
                    formData.append(fieldName, `${firstName} ${lastName}`);
                }
            }
            $('input[type="hidden"]').each((_, element) => {
                const name = $(element).attr('name');
                const value = $(element).attr('value');
                if (name && value) {
                    formData.append(name, value);
                }
            });
            await this.delay(1000);
            const searchResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post(searchUrl, formData.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Referer: searchUrl,
                },
                timeout: 10000,
            }));
            const results = await this.parseSearchResults(searchResponse.data, `${firstName} ${lastName}`);
            if (results && dateOfBirth) {
                return this.findBestMatch(results, firstName, lastName, dateOfBirth);
            }
            return results;
        }
        catch (error) {
            this.logger.error(`Error searching athlete ${firstName} ${lastName}:`, error);
            return null;
        }
    }
    async parseSearchResults(html, searchTerm) {
        try {
            const $ = cheerio.load(html);
            const athleteLinks = $('a[href*="personal.php"]');
            if (athleteLinks.length === 0) {
                this.logger.debug(`No athlete profiles found for: ${searchTerm}`);
                return null;
            }
            const firstLink = athleteLinks.first();
            const athleteUrl = firstLink.attr('href');
            const athleteName = firstLink.text().trim();
            if (!athleteUrl || !athleteName) {
                this.logger.debug(`Invalid athlete link found for: ${searchTerm}`);
                return null;
            }
            const nameParts = athleteName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            return await this.fetchAthleteDetails(athleteUrl, firstName, lastName);
        }
        catch (error) {
            this.logger.error(`Error parsing search results for ${searchTerm}:`, error);
            return null;
        }
    }
    async fetchAthleteDetails(athleteUrl, firstName, lastName) {
        try {
            const fullUrl = athleteUrl.startsWith('http')
                ? athleteUrl
                : `${this.PZLA_BASE_URL}${athleteUrl}`;
            await this.delay(1000);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(fullUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
                timeout: 10000,
            }));
            const $ = cheerio.load(response.data);
            let club = '';
            let licenseNumber = '';
            $('td, div, span').each((_, element) => {
                const text = $(element).text().trim();
                if (text.includes('Klub:') || text.includes('Club:')) {
                    club = text.replace(/Klub:|Club:/, '').trim();
                }
                if (text.includes('Licencja:') || text.includes('License:')) {
                    licenseNumber = text.replace(/Licencja:|License:/, '').trim();
                }
            });
            const results = await this.fetchAthleteResults(fullUrl);
            return {
                firstName,
                lastName,
                club: club || undefined,
                licenseNumber: licenseNumber || undefined,
                results,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching athlete details from ${athleteUrl}:`, error);
            return null;
        }
    }
    findBestMatch(athleteData, firstName, lastName, dateOfBirth) {
        const nameMatch = athleteData.firstName.toLowerCase().includes(firstName.toLowerCase()) &&
            athleteData.lastName.toLowerCase().includes(lastName.toLowerCase());
        if (nameMatch) {
            return athleteData;
        }
        return null;
    }
    async fetchAthleteResults(athleteUrl) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(athleteUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            }));
            const $ = cheerio.load(response.data);
            const results = [];
            $('table').each((tableIndex, table) => {
                const $table = $(table);
                const headers = $table.find('tr').first().find('th, td');
                let isResultsTable = false;
                headers.each((_, header) => {
                    const headerText = $(header).text().toLowerCase();
                    if (headerText.includes('konkurencja') ||
                        headerText.includes('wynik') ||
                        headerText.includes('data') ||
                        headerText.includes('event') ||
                        headerText.includes('result')) {
                        isResultsTable = true;
                    }
                });
                if (!isResultsTable)
                    return;
                $table.find('tr').each((rowIndex, row) => {
                    if (rowIndex === 0)
                        return;
                    const cells = $(row).find('td');
                    if (cells.length < 3)
                        return;
                    let event = '';
                    let result = '';
                    let date = '';
                    let competition = '';
                    let wind = '';
                    if (cells.length >= 4) {
                        event = $(cells[0]).text().trim();
                        result = $(cells[1]).text().trim();
                        date = $(cells[2]).text().trim();
                        competition = $(cells[3]).text().trim();
                        wind = $(cells[4])?.text().trim() || '';
                    }
                    else if (cells.length >= 3) {
                        result = $(cells[0]).text().trim();
                        event = $(cells[1]).text().trim();
                        date = $(cells[2]).text().trim();
                        competition = $(cells[3])?.text().trim() || '';
                    }
                    if (event && result && date) {
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
            if (results.length === 0) {
                $('.result-row, .wynik, .record').each((_, element) => {
                    const text = $(element).text().trim();
                    const match = text.match(/(\w+)\s+([0-9:.,]+)\s+(\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4})/);
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
        }
        catch (error) {
            this.logger.error(`Error fetching results from ${athleteUrl}:`, error);
            return [];
        }
    }
    async updateAthleteRecordsFromPzla(athleteId) {
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
            let pzlaData = null;
            if (athlete.licenseNumber) {
                pzlaData = await this.searchAthleteByLicense(athlete.licenseNumber);
            }
            if (!pzlaData) {
                pzlaData = await this.searchAthleteByName(athlete.firstName, athlete.lastName, athlete.dateOfBirth);
            }
            if (!pzlaData || pzlaData.results.length === 0) {
                return {
                    updated: false,
                    personalBests: athlete.personalBests,
                    seasonBests: athlete.seasonBests,
                    errors: ['No data found on PZLA website'],
                };
            }
            const { personalBests, seasonBests } = this.processPzlaResults(pzlaData.results, athlete.personalBests, athlete.seasonBests);
            const updatedAthlete = await this.prisma.athlete.update({
                where: { id: athleteId },
                data: {
                    personalBests,
                    seasonBests,
                    licenseNumber: athlete.licenseNumber || pzlaData.licenseNumber,
                },
            });
            this.logger.log(`Updated records for athlete ${athlete.firstName} ${athlete.lastName}`);
            return {
                updated: true,
                personalBests: updatedAthlete.personalBests,
                seasonBests: updatedAthlete.seasonBests,
                errors: [],
            };
        }
        catch (error) {
            this.logger.error(`Error updating athlete records from PZLA:`, error);
            return {
                updated: false,
                personalBests: null,
                seasonBests: null,
                errors: [error.message],
            };
        }
    }
    processPzlaResults(pzlaResults, existingPB = {}, existingSB = {}) {
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
            if (!personalBests[eventName] ||
                this.isBetterResult(result.result, personalBests[eventName].result, eventName)) {
                personalBests[eventName] = {
                    result: result.result,
                    date: result.date,
                    competition: result.competition,
                    wind: result.wind,
                };
            }
            if (isCurrentSeason || isLastQuarter) {
                if (!seasonBests[eventName] ||
                    this.isBetterResult(result.result, seasonBests[eventName].result, eventName)) {
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
    isBetterResult(newResult, existingResult, eventName) {
        const isTimeEvent = this.isTimeBasedEvent(eventName);
        if (isTimeEvent) {
            return (this.parseTimeToSeconds(newResult) <
                this.parseTimeToSeconds(existingResult));
        }
        else {
            return parseFloat(newResult) > parseFloat(existingResult);
        }
    }
    isTimeBasedEvent(eventName) {
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
    parseTimeToSeconds(timeStr) {
        if (!timeStr)
            return Infinity;
        const cleanTime = timeStr.replace(/[^\d:.,]/g, '').replace(',', '.');
        if (cleanTime.includes(':')) {
            const parts = cleanTime.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
            }
            else if (parts.length === 3) {
                return (parseInt(parts[0]) * 3600 +
                    parseInt(parts[1]) * 60 +
                    parseFloat(parts[2]));
            }
        }
        return parseFloat(cleanTime);
    }
    normalizeDate(dateStr) {
        if (!dateStr)
            return '';
        const cleanDate = dateStr.trim();
        const ddmmyyyy = cleanDate.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        if (ddmmyyyy) {
            const [, day, month, year] = ddmmyyyy;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        const yyyymmdd = cleanDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (yyyymmdd) {
            const [, year, month, day] = yyyymmdd;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        const ddmmyyyySlash = cleanDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (ddmmyyyySlash) {
            const [, day, month, year] = ddmmyyyySlash;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return cleanDate;
    }
    normalizeEventName(eventName) {
        const normalized = eventName.toUpperCase().trim();
        const eventMapping = {
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
    normalizeResult(result) {
        return result.trim().replace(',', '.');
    }
    async updateAllAthletesWithoutRecords() {
        const athletes = await this.prisma.athlete.findMany({
            where: {
                OR: [
                    { personalBests: { equals: client_1.Prisma.JsonNull } },
                    { seasonBests: { equals: client_1.Prisma.JsonNull } },
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
        const errors = [];
        for (const athlete of athletes) {
            try {
                const result = await this.updateAthleteRecordsFromPzla(athlete.id);
                processed++;
                if (result.updated) {
                    updated++;
                    this.logger.log(`Updated records for ${athlete.firstName} ${athlete.lastName}`);
                }
                else {
                    errors.push(...result.errors.map((error) => `${athlete.firstName} ${athlete.lastName}: ${error}`));
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            catch (error) {
                processed++;
                errors.push(`${athlete.firstName} ${athlete.lastName}: ${error.message}`);
            }
        }
        return { processed, updated, errors };
    }
    getMockAthleteData(licenseNumber) {
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
        return null;
    }
    getMockAthleteDataByName(firstName, lastName) {
        if (firstName.toLowerCase().includes('maja') &&
            lastName.toLowerCase().includes('guzman')) {
            return this.getMockAthleteData('Z/0298/23');
        }
        if (firstName.toLowerCase().includes('cezary') &&
            lastName.toLowerCase().includes('bykowski')) {
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
        return null;
    }
};
exports.PzlaIntegrationService = PzlaIntegrationService;
exports.PzlaIntegrationService = PzlaIntegrationService = PzlaIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService])
], PzlaIntegrationService);
//# sourceMappingURL=pzla-integration.service.js.map