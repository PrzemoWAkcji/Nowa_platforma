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
var AthletesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AthletesService = void 0;
const common_1 = require("@nestjs/common");
const csv = require("csv-parser");
const iconv = require("iconv-lite");
const stream_1 = require("stream");
const prisma_service_1 = require("../prisma/prisma.service");
let AthletesService = AthletesService_1 = class AthletesService {
    prisma;
    logger = new common_1.Logger(AthletesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAthleteDto) {
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
            take: 100,
        });
    }
    async findOne(id) {
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
    async findByCoach(coachId) {
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
    async findByCategory(category) {
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
                category: category,
            },
            orderBy: {
                lastName: 'asc',
            },
        });
    }
    async findByGender(gender) {
        const genderMap = {
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
    async update(id, updateAthleteDto) {
        const updateData = {
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
    async remove(id) {
        return this.prisma.athlete.delete({
            where: { id },
        });
    }
    async getAthleteStats(id) {
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
        const personalBests = athlete.results.filter((result) => result.isPersonalBest);
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
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10),
        };
    }
    async importFromCsv(fileBuffer, format, updateExisting = false) {
        const results = {
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: [],
        };
        try {
            const csvData = await this.parseCsv(fileBuffer);
            let detectedFormat = format;
            if (format === 'auto' && csvData.length > 0) {
                detectedFormat = this.detectFormat(csvData[0]);
            }
            for (const row of csvData) {
                try {
                    const athleteData = this.mapCsvRowToAthlete(row, detectedFormat);
                    if (!athleteData) {
                        results.skipped++;
                        continue;
                    }
                    const existingAthlete = await this.findExistingAthlete(athleteData);
                    if (existingAthlete) {
                        if (updateExisting) {
                            await this.update(existingAthlete.id, athleteData);
                            results.updated++;
                        }
                        else {
                            results.skipped++;
                        }
                    }
                    else {
                        await this.create(athleteData);
                        results.imported++;
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    results.errors.push(`Row error: ${errorMessage}`);
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.errors.push(`CSV parsing error: ${errorMessage}`);
        }
        return results;
    }
    async parseCsv(fileBuffer) {
        return new Promise((resolve, reject) => {
            const results = [];
            let csvData;
            try {
                csvData = fileBuffer.toString('utf-8');
                if (csvData.includes('�')) {
                    csvData = iconv.decode(fileBuffer, 'windows-1250');
                    if (csvData.includes('�')) {
                        csvData = iconv.decode(fileBuffer, 'iso-8859-2');
                    }
                }
            }
            catch {
                csvData = fileBuffer.toString('utf-8');
            }
            const stream = stream_1.Readable.from(csvData);
            stream
                .pipe(csv({ separator: ';' }))
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    }
    detectFormat(firstRow) {
        const pzlaColumns = ['Nazwisko', 'Imię', 'DataUr', 'NazwaPZLA', 'Klub'];
        const internationalColumns = [
            'FirstName',
            'LastName',
            'DateOfBirth',
            'Gender',
            'ClubName',
        ];
        const hasPZLAColumns = pzlaColumns.some((col) => Object.prototype.hasOwnProperty.call(firstRow, col));
        const hasInternationalColumns = internationalColumns.some((col) => Object.prototype.hasOwnProperty.call(firstRow, col));
        if (hasPZLAColumns) {
            return 'pzla';
        }
        else if (hasInternationalColumns) {
            return 'international';
        }
        return 'pzla';
    }
    mapCsvRowToAthlete(row, format) {
        try {
            if (format === 'pzla') {
                return this.mapPzlaFormat(row);
            }
            else {
                return this.mapInternationalFormat(row);
            }
        }
        catch (error) {
            this.logger.error('Error mapping CSV row:', error);
            return null;
        }
    }
    mapPzlaFormat(row) {
        const firstName = row['Imię']?.trim() || '';
        const lastName = row['Nazwisko']?.trim() || '';
        const dateOfBirth = row['DataUr']?.trim() || '';
        const club = row['Klub']?.trim() || '';
        if (!firstName || !lastName || !dateOfBirth) {
            return null;
        }
        const eventName = row['NazwaPZLA'] || '';
        const gender = eventName.toLowerCase().includes('kobiet') || eventName.startsWith('K')
            ? 'FEMALE'
            : 'MALE';
        const category = this.calculateCategory(dateOfBirth);
        return {
            firstName,
            lastName,
            dateOfBirth,
            gender: gender,
            club: club || undefined,
            category: category,
            nationality: 'POL',
        };
    }
    mapInternationalFormat(row) {
        const firstName = row['FirstName']?.trim() || '';
        const lastName = row['LastName']?.trim() || '';
        const dateOfBirth = row['DateOfBirth']?.trim() || '';
        const club = row['ClubName']?.trim() || '';
        const gender = row['Gender']?.trim() || '';
        const nationality = row['CountryCode']?.trim() || '';
        if (!firstName || !lastName || !dateOfBirth) {
            return null;
        }
        const mappedGender = gender === 'Male' ? 'MALE' : gender === 'Female' ? 'FEMALE' : 'MALE';
        const category = this.calculateCategory(dateOfBirth);
        return {
            firstName,
            lastName,
            dateOfBirth,
            gender: mappedGender,
            club: club || undefined,
            category: category,
            nationality: nationality || 'POL',
        };
    }
    calculateCategory(dateOfBirth) {
        const birthYear = new Date(dateOfBirth).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (age <= 16)
            return 'U16';
        if (age <= 18)
            return 'U18';
        if (age <= 20)
            return 'U20';
        if (age < 35)
            return 'SENIOR';
        if (age < 40)
            return 'M35';
        if (age < 45)
            return 'M40';
        if (age < 50)
            return 'M45';
        if (age < 55)
            return 'M50';
        if (age < 60)
            return 'M55';
        if (age < 65)
            return 'M60';
        if (age < 70)
            return 'M65';
        if (age < 75)
            return 'M70';
        if (age < 80)
            return 'M75';
        return 'M80';
    }
    async findExistingAthlete(athleteData) {
        return this.prisma.athlete.findFirst({
            where: {
                firstName: athleteData.firstName,
                lastName: athleteData.lastName,
                dateOfBirth: new Date(athleteData.dateOfBirth),
            },
        });
    }
    async updatePersonalAndSeasonBests(athleteId, eventName, result, competitionDate, competitionName) {
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
        const personalBests = athlete.personalBests || {};
        const seasonBests = athlete.seasonBests || {};
        const currentPB = personalBests[eventName];
        const isNewPB = !currentPB || this.compareResults(result, currentPB.result, eventName);
        const currentSB = seasonBests[eventName];
        const isNewSB = !currentSB ||
            new Date(currentSB.date).getFullYear() < resultYear ||
            (new Date(currentSB.date).getFullYear() === resultYear &&
                this.compareResults(result, currentSB.result, eventName));
        if (isNewPB) {
            personalBests[eventName] = {
                result,
                date: competitionDate.toISOString().split('T')[0],
                competition: competitionName,
            };
        }
        if (isNewSB) {
            seasonBests[eventName] = {
                result,
                date: competitionDate.toISOString().split('T')[0],
                competition: competitionName,
            };
        }
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
    compareResults(newResult, currentResult, eventName) {
        const isTimeEvent = this.isTimeBasedEvent(eventName);
        if (isTimeEvent) {
            return (this.parseTimeToSeconds(newResult) <
                this.parseTimeToSeconds(currentResult));
        }
        else {
            return parseFloat(newResult) > parseFloat(currentResult);
        }
    }
    isTimeBasedEvent(eventName) {
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
    parseTimeToSeconds(timeString) {
        const parts = timeString.split(':');
        if (parts.length === 1) {
            return parseFloat(parts[0]);
        }
        else if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        }
        else if (parts.length === 3) {
            return (parseInt(parts[0]) * 3600 +
                parseInt(parts[1]) * 60 +
                parseFloat(parts[2]));
        }
        return parseFloat(timeString);
    }
    async getAthleteRecords(athleteId, eventName) {
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
        const personalBests = athlete.personalBests || {};
        const seasonBests = athlete.seasonBests || {};
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
    async getAthletesSortedByRecords(eventName, sortBy = 'PB', gender, category, limit = 50) {
        const whereClause = {};
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
        const athletesWithRecords = athletes
            .map((athlete) => {
            const personalBests = athlete.personalBests || {};
            const seasonBests = athlete.seasonBests || {};
            const record = sortBy === 'PB' ? personalBests[eventName] : seasonBests[eventName];
            if (!record)
                return null;
            return {
                ...athlete,
                record,
                recordType: sortBy,
            };
        })
            .filter((athlete) => athlete !== null);
        const isTimeEvent = this.isTimeBasedEvent(eventName);
        athletesWithRecords.sort((a, b) => {
            if (isTimeEvent) {
                return (this.parseTimeToSeconds(a.record.result) -
                    this.parseTimeToSeconds(b.record.result));
            }
            else {
                return parseFloat(b.record.result) - parseFloat(a.record.result);
            }
        });
        return athletesWithRecords.slice(0, limit);
    }
    async clearSeasonBests(year) {
        const targetYear = year || new Date().getFullYear();
        const athletes = await this.prisma.athlete.findMany({
            select: {
                id: true,
                seasonBests: true,
            },
        });
        const athletesWithSB = athletes.filter((athlete) => athlete.seasonBests !== null);
        let clearedCount = 0;
        for (const athlete of athletesWithSB) {
            const seasonBests = athlete.seasonBests || {};
            let hasOldRecords = false;
            for (const eventName in seasonBests) {
                const record = seasonBests[eventName];
                const recordYear = new Date(record.date).getFullYear();
                if (recordYear < targetYear) {
                    delete seasonBests[eventName];
                    hasOldRecords = true;
                }
            }
            if (hasOldRecords) {
                await this.prisma.athlete.update({
                    where: { id: athlete.id },
                    data: {
                        seasonBests: Object.keys(seasonBests).length > 0 ? seasonBests : null,
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
};
exports.AthletesService = AthletesService;
exports.AthletesService = AthletesService = AthletesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AthletesService);
//# sourceMappingURL=athletes.service.js.map