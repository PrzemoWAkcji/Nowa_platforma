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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ScheduleGeneratorService = class ScheduleGeneratorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateSchedule(options) {
        const { competitionId, startTime, breakDuration = 15, parallelFieldEvents = true, separateCombinedEvents = true, selectedEventIds, } = options;
        const events = await this.prisma.event.findMany({
            where: {
                competitionId,
                ...(selectedEventIds && selectedEventIds.length > 0
                    ? { id: { in: selectedEventIds } }
                    : {}),
            },
            include: {
                registrationEvents: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ type: 'asc' }, { gender: 'asc' }, { category: 'asc' }],
        });
        if (events.length === 0) {
            throw new Error('No events found for this competition');
        }
        const trackEvents = events.filter((e) => e.type === client_1.EventType.TRACK);
        const fieldEvents = events.filter((e) => e.type === client_1.EventType.FIELD);
        const combinedEvents = events.filter((e) => e.type === client_1.EventType.COMBINED);
        const scheduleItems = [];
        let currentTime = new Date(startTime);
        const eventsToSchedule = separateCombinedEvents
            ? [...trackEvents, ...fieldEvents]
            : [...trackEvents, ...fieldEvents, ...combinedEvents];
        const eventGroups = this.groupEventsForScheduling(eventsToSchedule, parallelFieldEvents);
        for (const group of eventGroups) {
            const groupStartTime = new Date(currentTime);
            let maxDuration = 0;
            for (const event of group) {
                const participantsCount = event.registrationEvents.length;
                const estimatedDuration = this.calculateEventDuration(event, participantsCount);
                const { seriesCount, finalistsCount, rounds } = this.calculateEventStructure(event, participantsCount);
                for (const round of rounds) {
                    scheduleItems.push({
                        eventId: event.id,
                        scheduledTime: new Date(groupStartTime),
                        duration: round.duration,
                        round: round.type,
                        seriesCount: round.seriesCount,
                        finalistsCount: round.finalistsCount,
                        notes: this.generateEventNotes(event, participantsCount, round),
                    });
                    if (event.type !== client_1.EventType.FIELD || !parallelFieldEvents) {
                        currentTime = new Date(currentTime.getTime() + round.duration * 60000);
                    }
                }
                maxDuration = Math.max(maxDuration, estimatedDuration);
            }
            if (parallelFieldEvents &&
                group.some((e) => e.type === client_1.EventType.FIELD)) {
                currentTime = new Date(groupStartTime.getTime() + maxDuration * 60000);
            }
            currentTime = new Date(currentTime.getTime() + breakDuration * 60000);
        }
        if (separateCombinedEvents && combinedEvents.length > 0) {
            currentTime = new Date(currentTime.getTime() + 30 * 60000);
            for (const event of combinedEvents) {
                const participantsCount = event.registrationEvents.length;
                const duration = this.calculateEventDuration(event, participantsCount);
                scheduleItems.push({
                    eventId: event.id,
                    scheduledTime: new Date(currentTime),
                    duration,
                    round: 'FINAL',
                    seriesCount: 1,
                    finalistsCount: null,
                    notes: `Wielobój - ${participantsCount} zawodników`,
                });
                currentTime = new Date(currentTime.getTime() + duration * 60000 + breakDuration * 60000);
            }
        }
        return scheduleItems;
    }
    groupEventsForScheduling(events, parallelFieldEvents) {
        if (!parallelFieldEvents) {
            return events.map((event) => [event]);
        }
        const groups = [];
        const trackEvents = events.filter((e) => e.type === client_1.EventType.TRACK);
        const fieldEvents = events.filter((e) => e.type === client_1.EventType.FIELD);
        for (const trackEvent of trackEvents) {
            groups.push([trackEvent]);
        }
        const fieldGroups = this.groupFieldEvents(fieldEvents);
        groups.push(...fieldGroups);
        return groups;
    }
    groupFieldEvents(fieldEvents) {
        const groups = [];
        const jumps = fieldEvents.filter((e) => e.discipline?.includes('jump') ||
            e.name.toLowerCase().includes('skok') ||
            e.name.toLowerCase().includes('wzwyż') ||
            e.name.toLowerCase().includes('dal'));
        const throws = fieldEvents.filter((e) => e.discipline?.includes('throw') ||
            e.name.toLowerCase().includes('rzut') ||
            e.name.toLowerCase().includes('kula') ||
            e.name.toLowerCase().includes('dysk'));
        if (jumps.length > 0) {
            const jumpGroups = this.groupByAgeAndGender(jumps);
            groups.push(...jumpGroups);
        }
        if (throws.length > 0) {
            const throwGroups = this.groupByAgeAndGender(throws);
            groups.push(...throwGroups);
        }
        return groups;
    }
    groupByAgeAndGender(events) {
        const groups = new Map();
        for (const event of events) {
            const key = `${event.gender}_${event.category}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)?.push(event);
        }
        return Array.from(groups.values());
    }
    calculateEventStructure(event, participantsCount) {
        const maxLanes = 8;
        const rounds = [];
        let finalistsCount = null;
        if (event.type === client_1.EventType.TRACK) {
            if (participantsCount <= maxLanes) {
                rounds.push({
                    type: 'FINAL',
                    seriesCount: 1,
                    finalistsCount: null,
                    duration: this.getBaseDuration(event),
                });
            }
            else if (participantsCount <= 16) {
                const heatsCount = Math.ceil(participantsCount / maxLanes);
                rounds.push({
                    type: 'QUALIFICATION',
                    seriesCount: heatsCount,
                    finalistsCount: 8,
                    duration: heatsCount * this.getBaseDuration(event),
                });
                rounds.push({
                    type: 'FINAL',
                    seriesCount: 1,
                    finalistsCount: null,
                    duration: this.getBaseDuration(event),
                });
                finalistsCount = 8;
            }
            else {
                const qualHeats = Math.ceil(participantsCount / maxLanes);
                const semifinalists = 16;
                const semiHeats = Math.ceil(semifinalists / maxLanes);
                rounds.push({
                    type: 'QUALIFICATION',
                    seriesCount: qualHeats,
                    finalistsCount: semifinalists,
                    duration: qualHeats * this.getBaseDuration(event),
                });
                rounds.push({
                    type: 'SEMIFINAL',
                    seriesCount: semiHeats,
                    finalistsCount: 8,
                    duration: semiHeats * this.getBaseDuration(event),
                });
                rounds.push({
                    type: 'FINAL',
                    seriesCount: 1,
                    finalistsCount: null,
                    duration: this.getBaseDuration(event),
                });
                finalistsCount = 8;
            }
        }
        else {
            rounds.push({
                type: 'FINAL',
                seriesCount: 1,
                finalistsCount: null,
                duration: this.calculateFieldEventDuration(event, participantsCount),
            });
        }
        return {
            seriesCount: rounds.reduce((sum, round) => sum + round.seriesCount, 0),
            finalistsCount,
            rounds,
        };
    }
    calculateEventDuration(event, participantsCount) {
        if (event.type === client_1.EventType.TRACK) {
            return this.calculateTrackEventDuration(event, participantsCount);
        }
        else if (event.type === client_1.EventType.FIELD) {
            return this.calculateFieldEventDuration(event, participantsCount);
        }
        else {
            return 120;
        }
    }
    calculateTrackEventDuration(event, participantsCount) {
        const baseDuration = this.getBaseDuration(event);
        const heatsCount = Math.ceil(participantsCount / 8);
        return heatsCount * baseDuration + (heatsCount - 1) * 5;
    }
    calculateFieldEventDuration(event, participantsCount) {
        const timePerAthlete = 3.5;
        return Math.max(30, participantsCount * timePerAthlete);
    }
    getBaseDuration(event) {
        const distance = event.distance?.toLowerCase() || event.name?.toLowerCase() || '';
        if (distance.includes('100m') || distance.includes('60m'))
            return 10;
        if (distance.includes('200m'))
            return 12;
        if (distance.includes('400m'))
            return 15;
        if (distance.includes('800m'))
            return 20;
        if (distance.includes('1500m'))
            return 25;
        if (distance.includes('3000m'))
            return 35;
        if (distance.includes('5000m'))
            return 45;
        if (distance.includes('10000m'))
            return 90;
        if (distance.includes('płotki') || distance.includes('hurdles'))
            return 15;
        if (distance.includes('sztafeta') || distance.includes('relay'))
            return 15;
        return 15;
    }
    generateEventNotes(event, participantsCount, round) {
        const notes = [];
        if (participantsCount > 0) {
            notes.push(`${participantsCount} zawodników`);
        }
        if (round.seriesCount > 1) {
            notes.push(`${round.seriesCount} serii`);
        }
        if (round.finalistsCount) {
            notes.push(`${round.finalistsCount} do finału`);
        }
        return notes.join(', ');
    }
    async generateMinuteProgram(competitionId) {
        const schedule = await this.prisma.competitionSchedule.findFirst({
            where: {
                competitionId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                items: {
                    include: {
                        event: true,
                    },
                    orderBy: {
                        scheduledTime: 'asc',
                    },
                },
                competition: true,
            },
        });
        if (!schedule) {
            throw new Error('No schedule found for this competition');
        }
        const timeGroups = new Map();
        for (const item of schedule.items) {
            const timeKey = item.scheduledTime.toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit',
            });
            if (!timeGroups.has(timeKey)) {
                timeGroups.set(timeKey, []);
            }
            timeGroups.get(timeKey).push({
                time: timeKey,
                eventName: this.formatEventName(item.event),
                round: this.formatRound(item.round),
                series: item.seriesCount > 1 ? `${item.seriesCount} serii` : null,
                finalists: item.finalistsCount
                    ? `${item.finalistsCount} do finału`
                    : null,
                notes: item.notes,
            });
        }
        return {
            competition: schedule.competition,
            schedule: schedule,
            timeGroups: Array.from(timeGroups.entries()).map(([time, events]) => ({
                time,
                events,
            })),
        };
    }
    formatEventName(event) {
        const parts = [];
        if (event.distance) {
            parts.push(event.distance);
        }
        else if (event.name) {
            parts.push(event.name);
        }
        parts.push(event.gender === 'MALE' ? 'M' : event.gender === 'FEMALE' ? 'K' : 'MIX');
        if (event.category && event.category !== 'SENIOR') {
            parts.push(this.formatCategory(event.category));
        }
        return parts.join(' ');
    }
    formatRound(round) {
        switch (round) {
            case 'QUALIFICATION':
                return 'eliminacje';
            case 'SEMIFINAL':
                return 'półfinał';
            case 'FINAL':
                return 'finał';
            case 'QUALIFICATION_A':
                return 'elim. A';
            case 'QUALIFICATION_B':
                return 'elim. B';
            case 'QUALIFICATION_C':
                return 'elim. C';
            default:
                return round.toLowerCase();
        }
    }
    formatCategory(category) {
        if (!category)
            return '';
        if (category.startsWith('U'))
            return category;
        if (category.startsWith('M'))
            return category;
        if (category.startsWith('AGE_'))
            return category.replace('AGE_', '') + ' lat';
        return category;
    }
};
exports.ScheduleGeneratorService = ScheduleGeneratorService;
exports.ScheduleGeneratorService = ScheduleGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleGeneratorService);
//# sourceMappingURL=schedule-generator.service.js.map