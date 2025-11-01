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
var ResultsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsService = void 0;
const common_1 = require("@nestjs/common");
const athletes_service_1 = require("../athletes/athletes.service");
const prisma_service_1 = require("../prisma/prisma.service");
const records_service_1 = require("../records/records.service");
let ResultsService = ResultsService_1 = class ResultsService {
    prisma;
    athletesService;
    recordsService;
    logger = new common_1.Logger(ResultsService_1.name);
    constructor(prisma, athletesService, recordsService) {
        this.prisma = prisma;
        this.athletesService = athletesService;
        this.recordsService = recordsService;
    }
    async create(createResultDto) {
        const athlete = await this.prisma.athlete.findUnique({
            where: { id: createResultDto.athleteId },
        });
        if (!athlete) {
            throw new common_1.NotFoundException('Athlete not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: createResultDto.eventId },
            include: {
                competition: true,
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const registration = await this.prisma.registration.findUnique({
            where: { id: createResultDto.registrationId },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        const existingResult = await this.prisma.result.findFirst({
            where: {
                athleteId: createResultDto.athleteId,
                eventId: createResultDto.eventId,
                registrationId: createResultDto.registrationId,
            },
        });
        if (existingResult) {
            throw new common_1.BadRequestException('Result already exists for this athlete/event combination');
        }
        let isPersonalBest = createResultDto.isPersonalBest ?? false;
        let isSeasonBest = createResultDto.isSeasonBest ?? false;
        if (createResultDto.isValid !== false &&
            !createResultDto.isDNF &&
            !createResultDto.isDNS &&
            !createResultDto.isDQ &&
            createResultDto.result) {
            try {
                const eventName = this.getEventNameForRecords(event);
                const recordsUpdate = await this.athletesService.updatePersonalAndSeasonBests(createResultDto.athleteId, eventName, createResultDto.result, event.competition?.startDate || new Date(), event.competition?.name || 'Unknown Competition');
                isPersonalBest = recordsUpdate.isNewPB;
                isSeasonBest = recordsUpdate.isNewSB;
            }
            catch (error) {
                this.logger.warn('Failed to update PB/SB:', error.message);
            }
        }
        const recordChecks = await this.checkForRecords(createResultDto.athleteId, createResultDto.eventId, createResultDto.result);
        return this.prisma.result.create({
            data: {
                ...createResultDto,
                isValid: createResultDto.isValid ?? true,
                isDNF: createResultDto.isDNF ?? false,
                isDNS: createResultDto.isDNS ?? false,
                isDQ: createResultDto.isDQ ?? false,
                isPersonalBest,
                isSeasonBest,
                isNationalRecord: recordChecks.isNationalRecord ||
                    createResultDto.isNationalRecord ||
                    false,
                isWorldRecord: recordChecks.isWorldRecord || createResultDto.isWorldRecord || false,
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
    async findByEvent(eventId) {
        return this.prisma.result.findMany({
            where: { eventId },
            include: {
                athlete: true,
                event: true,
            },
            orderBy: [{ position: 'asc' }, { result: 'asc' }],
        });
    }
    async findByAthlete(athleteId) {
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
    async findByCompetition(competitionId) {
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
    async findPersonalBests(athleteId) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Result not found');
        }
        return result;
    }
    async update(id, updateResultDto) {
        const result = await this.prisma.result.findUnique({
            where: { id },
        });
        if (!result) {
            throw new common_1.NotFoundException('Result not found');
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
    async remove(id) {
        const result = await this.prisma.result.findUnique({
            where: { id },
        });
        if (!result) {
            throw new common_1.NotFoundException('Result not found');
        }
        return this.prisma.result.delete({
            where: { id },
        });
    }
    async calculatePositions(eventId) {
        const results = await this.prisma.result.findMany({
            where: {
                eventId,
                isValid: true,
                isDNF: false,
                isDNS: false,
                isDQ: false,
            },
            orderBy: {
                result: 'asc',
            },
        });
        for (let i = 0; i < results.length; i++) {
            await this.prisma.result.update({
                where: { id: results[i].id },
                data: { position: i + 1 },
            });
        }
        return results;
    }
    async getEventResults(eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                competition: true,
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
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
    async getAthleteResultsInEvent(athleteId, eventName) {
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
    getEventNameForRecords(event) {
        const eventName = event.name.toUpperCase();
        if (eventName.includes('100') &&
            eventName.includes('M') &&
            !eventName.includes('H'))
            return '100M';
        if (eventName.includes('200') && eventName.includes('M'))
            return '200M';
        if (eventName.includes('400') &&
            eventName.includes('M') &&
            !eventName.includes('H'))
            return '400M';
        if (eventName.includes('800') && eventName.includes('M'))
            return '800M';
        if (eventName.includes('1500') && eventName.includes('M'))
            return '1500M';
        if (eventName.includes('3000') &&
            eventName.includes('M') &&
            !eventName.includes('SC'))
            return '3000M';
        if (eventName.includes('5000') && eventName.includes('M'))
            return '5000M';
        if (eventName.includes('10000') && eventName.includes('M'))
            return '10000M';
        if (eventName.includes('110') && eventName.includes('H'))
            return '110MH';
        if (eventName.includes('100') && eventName.includes('H'))
            return '100MH';
        if (eventName.includes('400') && eventName.includes('H'))
            return '400MH';
        if (eventName.includes('80') && eventName.includes('H'))
            return '80MH';
        if (eventName.includes('600') && eventName.includes('M'))
            return '600M';
        if (eventName.includes('1000') && eventName.includes('M'))
            return '1000M';
        if (eventName.includes('3000') && eventName.includes('SC'))
            return '3000MSC';
        if (eventName.includes('LONG') || eventName.includes('SKOK W DAL'))
            return 'LJ';
        if (eventName.includes('HIGH') || eventName.includes('SKOK WZWYŻ'))
            return 'HJ';
        if (eventName.includes('POLE') || eventName.includes('SKOK O TYCZCE'))
            return 'PV';
        if (eventName.includes('TRIPLE') || eventName.includes('TRÓJSKOK'))
            return 'TJ';
        if (eventName.includes('SHOT') || eventName.includes('PCHNIĘCIE KULĄ')) {
            if (eventName.includes('3KG') || eventName.includes('3 KG'))
                return 'SP3';
            if (eventName.includes('5KG') || eventName.includes('5 KG'))
                return 'SP5';
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
    async checkForRecords(athleteId, eventId, result) {
        try {
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
            const resultValue = this.parseResultToSeconds(result, event.type);
            if (resultValue === null) {
                return { isNationalRecord: false, isWorldRecord: false };
            }
            const nationalRecord = await this.getBestNationalRecord(event.name, athlete.nationality || 'UNKNOWN', athlete.gender, athlete.category);
            const worldRecord = await this.getBestWorldRecord(event.name, athlete.gender, athlete.category);
            const isNationalRecord = nationalRecord
                ? this.isResultBetter(resultValue, nationalRecord, event.type)
                : false;
            const isWorldRecord = worldRecord
                ? this.isResultBetter(resultValue, worldRecord, event.type)
                : false;
            return { isNationalRecord, isWorldRecord };
        }
        catch (error) {
            this.logger.warn('Failed to check records:', error.message);
            return { isNationalRecord: false, isWorldRecord: false };
        }
    }
    parseResultToSeconds(result, eventType) {
        try {
            if (eventType === 'TRACK' || eventType === 'HURDLES') {
                if (result.includes(':')) {
                    const [minutes, seconds] = result.split(':');
                    return parseInt(minutes) * 60 + parseFloat(seconds);
                }
                return parseFloat(result);
            }
            if (eventType === 'FIELD') {
                return parseFloat(result.replace(/[^\d.]/g, ''));
            }
            return parseFloat(result);
        }
        catch {
            return null;
        }
    }
    isResultBetter(newResult, recordResult, eventType) {
        if (eventType === 'TRACK' || eventType === 'HURDLES') {
            return newResult < recordResult;
        }
        return newResult > recordResult;
    }
    async getBestNationalRecord(eventName, nationality, gender, category) {
        try {
            const record = await this.recordsService.getBestRecord(eventName, 'NATIONAL', gender, category, nationality, false);
            return record ? record.resultValue : null;
        }
        catch {
            return null;
        }
    }
    async getBestWorldRecord(eventName, gender, category) {
        try {
            const record = await this.recordsService.getBestRecord(eventName, 'WORLD', gender, category, undefined, false);
            return record ? record.resultValue : null;
        }
        catch {
            return null;
        }
    }
};
exports.ResultsService = ResultsService;
exports.ResultsService = ResultsService = ResultsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        athletes_service_1.AthletesService,
        records_service_1.RecordsService])
], ResultsService);
//# sourceMappingURL=results.service.js.map