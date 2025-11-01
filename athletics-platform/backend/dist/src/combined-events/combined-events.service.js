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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinedEventsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
const combined_events_types_1 = require("./types/combined-events.types");
const scoring_tables_1 = require("./constants/scoring-tables");
let CombinedEventsService = class CombinedEventsService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    calculatePoints(discipline, performance, gender = 'MALE') {
        const coefficients = (0, scoring_tables_1.getScoringCoefficients)(discipline, gender);
        if (coefficients.A === 0) {
            throw new Error(`Nieznana dyscyplina: ${discipline}`);
        }
        let performanceValue;
        let points;
        if ((0, scoring_tables_1.isTrackEvent)(discipline)) {
            performanceValue = (0, scoring_tables_1.parseTimeToSeconds)(performance);
            const timeDiff = coefficients.B - performanceValue;
            if (timeDiff <= 0) {
                return 0;
            }
            points = coefficients.A * Math.pow(timeDiff, coefficients.C);
        }
        else {
            if (discipline === 'HJ' || discipline === 'PV') {
                performanceValue = (0, scoring_tables_1.parseHeightToMeters)(performance) * 100;
            }
            else if (discipline === 'LJ') {
                performanceValue = (0, scoring_tables_1.parseDistanceToMeters)(performance) * 100;
            }
            else {
                performanceValue = (0, scoring_tables_1.parseDistanceToMeters)(performance);
            }
            const performanceDiff = performanceValue - coefficients.B;
            if (performanceDiff <= 0) {
                return 0;
            }
            points = coefficients.A * Math.pow(performanceDiff, coefficients.C);
        }
        return Math.round(points);
    }
    getAvailableEventTypes() {
        return [
            {
                type: combined_events_types_1.CombinedEventType.DECATHLON,
                name: 'Dziesięciobój',
                description: 'Oficjalny 10-bój męski (World Athletics)',
                gender: 'MALE',
                disciplines: 10,
                official: true,
                category: 'World Athletics',
            },
            {
                type: combined_events_types_1.CombinedEventType.HEPTATHLON,
                name: 'Siedmiobój',
                description: 'Oficjalny 7-bój żeński (World Athletics)',
                gender: 'FEMALE',
                disciplines: 7,
                official: true,
                category: 'World Athletics',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR,
                name: 'Pięciobój Indoor',
                description: 'Oficjalny 5-bój halowy (World Athletics)',
                gender: 'BOTH',
                disciplines: 5,
                official: true,
                category: 'World Athletics',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR,
                name: 'Pięciobój Outdoor',
                description: 'Oficjalny 5-bój zewnętrzny (World Athletics)',
                gender: 'BOTH',
                disciplines: 5,
                official: true,
                category: 'World Athletics',
            },
            {
                type: combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
                name: 'Dziesięciobój Masters',
                description: 'Dziesięciobój dla kategorii Masters 35+ (WMA)',
                gender: 'MALE',
                disciplines: 10,
                official: true,
                category: 'Masters (WMA)',
            },
            {
                type: combined_events_types_1.CombinedEventType.HEPTATHLON_MASTERS,
                name: 'Siedmiobój Masters',
                description: 'Siedmiobój dla kategorii Masters 35+ (WMA)',
                gender: 'FEMALE',
                disciplines: 7,
                official: true,
                category: 'Masters (WMA)',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR_MASTERS,
                name: 'Pięciobój Indoor Masters',
                description: 'Pięciobój halowy dla kategorii Masters 35+ (WMA)',
                gender: 'BOTH',
                disciplines: 5,
                official: true,
                category: 'Masters (WMA)',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
                name: 'Pięciobój Outdoor Masters',
                description: 'Pięciobój zewnętrzny dla kategorii Masters 35+ (WMA)',
                gender: 'BOTH',
                disciplines: 5,
                official: true,
                category: 'Masters (WMA)',
            },
            {
                type: combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS,
                name: 'Pięciobój Rzutowy Masters',
                description: 'Pięciobój rzutowy dla kategorii Masters 35+ (WMA)',
                gender: 'BOTH',
                disciplines: 5,
                official: true,
                category: 'Masters (WMA)',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_U16_MALE,
                name: 'Pięciobój U16 Chłopcy',
                description: 'Niestandardowy pięciobój dla chłopców U16',
                gender: 'MALE',
                disciplines: 5,
                official: false,
                category: 'Niestandardowe',
            },
            {
                type: combined_events_types_1.CombinedEventType.PENTATHLON_U16_FEMALE,
                name: 'Pięciobój U16 Dziewczęta',
                description: 'Niestandardowy pięciobój dla dziewcząt U16',
                gender: 'FEMALE',
                disciplines: 5,
                official: false,
                category: 'Niestandardowe',
            },
        ];
    }
    getDisciplinesForEvent(eventType, gender) {
        if (eventType === combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS) {
            if (gender === 'MALE') {
                return [
                    combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                    combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
                    combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
                    combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
                    combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
                ];
            }
            else {
                return [
                    combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
                    combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
                    combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
                    combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
                    combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
                ];
            }
        }
        return combined_events_types_1.COMBINED_EVENT_DISCIPLINES[eventType] || [];
    }
    async createCombinedEvent(createDto) {
        const disciplines = this.getDisciplinesForEvent(createDto.eventType, createDto.gender);
        if (!disciplines || disciplines.length === 0) {
            throw new Error(`Nieznany typ wieloboju: ${createDto.eventType}`);
        }
        const combinedEvent = await this.prisma.combinedEvent.create({
            data: {
                eventType: createDto.eventType,
                athleteId: createDto.athleteId,
                competitionId: createDto.competitionId,
                gender: createDto.gender,
                totalPoints: 0,
                isComplete: false,
            },
        });
        const disciplineResults = await Promise.all(disciplines.map((discipline, index) => this.prisma.combinedEventResult.create({
            data: {
                combinedEventId: combinedEvent.id,
                discipline: discipline,
                dayOrder: index + 1,
                performance: null,
                points: 0,
                isValid: false,
            },
        })));
        return {
            ...combinedEvent,
            results: disciplineResults,
        };
    }
    async updateEventResult(combinedEventId, discipline, updateDto) {
        return await this.prisma.$transaction(async (prisma) => {
            const combinedEvent = await prisma.combinedEvent.findUnique({
                where: { id: combinedEventId },
                include: { results: true },
            });
            if (!combinedEvent) {
                throw new Error('Wielobój nie został znaleziony');
            }
            const validDisciplines = this.getDisciplinesForEvent(combinedEvent.eventType, combinedEvent.gender);
            const disciplineExists = validDisciplines.some(d => d === discipline);
            if (!disciplineExists) {
                throw new Error(`Dyscyplina ${discipline} nie jest częścią wieloboju ${combinedEvent.eventType}`);
            }
            const points = this.calculatePoints(discipline, updateDto.performance, combinedEvent.gender);
            const updatedResult = await prisma.combinedEventResult.update({
                where: {
                    combinedEventId_discipline: {
                        combinedEventId,
                        discipline,
                    },
                },
                data: {
                    performance: updateDto.performance,
                    points,
                    wind: updateDto.wind,
                    isValid: true,
                    updatedAt: new Date(),
                },
            });
            const results = await prisma.combinedEventResult.findMany({
                where: { combinedEventId },
            });
            const totalPoints = results
                .filter((result) => result.isValid)
                .reduce((sum, result) => sum + result.points, 0);
            const validResultsCount = results.filter((result) => result.isValid).length;
            const expectedResultsCount = results.length;
            const isComplete = validResultsCount === expectedResultsCount;
            await prisma.combinedEvent.update({
                where: { id: combinedEventId },
                data: {
                    totalPoints,
                    isComplete,
                    updatedAt: new Date(),
                },
            });
            const eventForCache = await prisma.combinedEvent.findUnique({
                where: { id: combinedEventId },
                select: { competitionId: true, eventType: true },
            });
            if (eventForCache) {
                const cacheKey = `ranking:${eventForCache.competitionId}:${eventForCache.eventType}`;
                await this.cacheManager.del(cacheKey);
            }
            return updatedResult;
        });
    }
    async recalculateTotalPoints(combinedEventId) {
        const results = await this.prisma.combinedEventResult.findMany({
            where: { combinedEventId },
        });
        const totalPoints = results
            .filter((result) => result.isValid)
            .reduce((sum, result) => sum + result.points, 0);
        const validResultsCount = results.filter((result) => result.isValid).length;
        const expectedResultsCount = results.length;
        const isComplete = validResultsCount === expectedResultsCount;
        return await this.prisma.combinedEvent.update({
            where: { id: combinedEventId },
            data: {
                totalPoints,
                isComplete,
                updatedAt: new Date(),
            },
        });
    }
    async getCombinedEvent(id) {
        return await this.prisma.combinedEvent.findUnique({
            where: { id },
            include: {
                results: {
                    orderBy: { dayOrder: 'asc' },
                },
                athlete: true,
                competition: true,
            },
        });
    }
    async getCombinedEventsByCompetition(competitionId) {
        return await this.prisma.combinedEvent.findMany({
            where: { competitionId },
            include: {
                results: {
                    orderBy: { dayOrder: 'asc' },
                },
                athlete: true,
            },
            orderBy: { totalPoints: 'desc' },
        });
    }
    async getCombinedEventsPaginated(competitionId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            this.prisma.combinedEvent.findMany({
                where: { competitionId },
                include: {
                    athlete: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            club: true,
                        },
                    },
                },
                orderBy: { totalPoints: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.combinedEvent.count({
                where: { competitionId },
            }),
        ]);
        return {
            data: events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        };
    }
    async getCombinedEventRanking(competitionId, eventType) {
        const cacheKey = `ranking:${competitionId}:${eventType}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const events = await this.prisma.combinedEvent.findMany({
            where: {
                competitionId,
                eventType,
                isComplete: true,
            },
            include: {
                athlete: true,
                results: {
                    orderBy: { dayOrder: 'asc' },
                },
            },
            orderBy: { totalPoints: 'desc' },
        });
        const ranking = events.map((event, index) => ({
            ...event,
            position: index + 1,
        }));
        await this.cacheManager.set(cacheKey, ranking, 120000);
        return ranking;
    }
    async deleteCombinedEvent(id) {
        await this.prisma.combinedEventResult.deleteMany({
            where: { combinedEventId: id },
        });
        return await this.prisma.combinedEvent.delete({
            where: { id },
        });
    }
    async getCombinedEventStatistics(competitionId) {
        const events = await this.prisma.combinedEvent.findMany({
            where: { competitionId },
            select: {
                id: true,
                eventType: true,
                totalPoints: true,
                isComplete: true,
            },
        });
        const statistics = {
            totalEvents: events.length,
            completedEvents: events.filter((e) => e.isComplete).length,
            averagePoints: 0,
            bestPerformance: null,
            eventTypeBreakdown: {},
        };
        if (events.length > 0) {
            const completedEvents = events.filter((e) => e.isComplete);
            if (completedEvents.length > 0) {
                statistics.averagePoints = Math.round(completedEvents.reduce((sum, e) => sum + e.totalPoints, 0) /
                    completedEvents.length);
                statistics.bestPerformance = completedEvents.reduce((best, current) => current.totalPoints > best.totalPoints ? current : best);
            }
            events.forEach((event) => {
                statistics.eventTypeBreakdown[event.eventType] =
                    (statistics.eventTypeBreakdown[event.eventType] || 0) + 1;
            });
        }
        return statistics;
    }
    validatePerformance(discipline, performance) {
        try {
            if ((0, scoring_tables_1.isTrackEvent)(discipline)) {
                const seconds = (0, scoring_tables_1.parseTimeToSeconds)(performance);
                switch (discipline) {
                    case '100M':
                        return seconds >= 9.0 && seconds <= 15.0;
                    case '110MH':
                    case '100MH':
                        return seconds >= 11.0 && seconds <= 20.0;
                    case '80MH':
                        return seconds >= 9.5 && seconds <= 16.0;
                    case '600M':
                        return seconds >= 60.0 && seconds <= 180.0;
                    case '1000M':
                        return seconds >= 120.0 && seconds <= 360.0;
                    case '200M':
                        return seconds >= 19.0 && seconds <= 35.0;
                    case '400M':
                        return seconds >= 40.0 && seconds <= 80.0;
                    case '60M':
                        return seconds >= 6.0 && seconds <= 10.0;
                    case '60MH':
                        return seconds >= 7.0 && seconds <= 12.0;
                    case '800M':
                        return seconds >= 90.0 && seconds <= 300.0;
                    case '1500M':
                        return seconds >= 180.0 && seconds <= 600.0;
                    default:
                        return seconds > 0 && seconds < 3600;
                }
            }
            else {
                if (discipline === 'HJ') {
                    const meters = (0, scoring_tables_1.parseHeightToMeters)(performance);
                    return meters >= 1.0 && meters <= 3.0;
                }
                else if (discipline === 'PV') {
                    const meters = (0, scoring_tables_1.parseHeightToMeters)(performance);
                    return meters >= 2.0 && meters <= 7.0;
                }
                else if (discipline === 'LJ') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 3.0 && meters <= 12.0;
                }
                else if (discipline === 'SP') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 5.0 && meters <= 25.0;
                }
                else if (discipline === 'SP3') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 4.0 && meters <= 20.0;
                }
                else if (discipline === 'SP5') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 5.0 && meters <= 22.0;
                }
                else if (discipline === 'DT') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 15.0 && meters <= 80.0;
                }
                else if (discipline === 'JT') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 20.0 && meters <= 100.0;
                }
                else if (discipline === 'HT') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 15.0 && meters <= 90.0;
                }
                else if (discipline === 'WT') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 8.0 && meters <= 30.0;
                }
                else if (discipline === 'TJ') {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters >= 8.0 && meters <= 20.0;
                }
                else {
                    const meters = (0, scoring_tables_1.parseDistanceToMeters)(performance);
                    return meters > 0 && meters < 200;
                }
            }
        }
        catch {
            return false;
        }
    }
};
exports.CombinedEventsService = CombinedEventsService;
exports.CombinedEventsService = CombinedEventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], CombinedEventsService);
//# sourceMappingURL=combined-events.service.js.map