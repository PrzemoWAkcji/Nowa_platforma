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
exports.HeatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const auto_assign_dto_1 = require("./dto/auto-assign.dto");
const client_1 = require("@prisma/client");
let HeatService = class HeatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createHeatDto) {
        const { eventId, heatNumber, round, maxLanes, scheduledTime, notes, assignments, } = createHeatDto;
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const existingHeat = await this.prisma.heat.findUnique({
            where: {
                eventId_heatNumber_round: {
                    eventId,
                    heatNumber,
                    round: round,
                },
            },
        });
        if (existingHeat) {
            throw new common_1.BadRequestException(`Heat ${heatNumber} for round ${round} already exists`);
        }
        const heat = await this.prisma.heat.create({
            data: {
                eventId,
                heatNumber,
                round: round,
                maxLanes: maxLanes || 20,
                scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
                notes,
                assignments: assignments
                    ? {
                        create: assignments.map((assignment) => ({
                            registrationId: assignment.registrationId,
                            lane: assignment.lane,
                            seedTime: assignment.seedTime,
                            seedRank: assignment.seedRank,
                            assignmentMethod: assignment.assignmentMethod ||
                                client_1.AssignmentMethod.MANUAL,
                            isPresent: assignment.isPresent !== false,
                        })),
                    }
                    : undefined,
            },
            include: {
                event: true,
                assignments: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                    orderBy: {
                        lane: 'asc',
                    },
                },
            },
        });
        return heat;
    }
    async findAll(eventId, round) {
        const where = {};
        if (eventId)
            where.eventId = eventId;
        if (round)
            where.round = round;
        return this.prisma.heat.findMany({
            where,
            include: {
                event: true,
                assignments: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                    orderBy: {
                        lane: 'asc',
                    },
                },
            },
            orderBy: [{ eventId: 'asc' }, { round: 'asc' }, { heatNumber: 'asc' }],
        });
    }
    async findOne(id) {
        const heat = await this.prisma.heat.findUnique({
            where: { id },
            include: {
                event: true,
                assignments: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                    orderBy: {
                        lane: 'asc',
                    },
                },
            },
        });
        if (!heat) {
            throw new common_1.NotFoundException('Heat not found');
        }
        return heat;
    }
    async update(id, updateHeatDto) {
        const existingHeat = await this.findOne(id);
        const { assignments, ...heatData } = updateHeatDto;
        const updatedHeat = await this.prisma.heat.update({
            where: { id },
            data: {
                ...heatData,
                scheduledTime: heatData.scheduledTime
                    ? new Date(heatData.scheduledTime)
                    : undefined,
                round: heatData.round ? heatData.round : undefined,
            },
            include: {
                event: true,
                assignments: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                    orderBy: {
                        lane: 'asc',
                    },
                },
            },
        });
        return updatedHeat;
    }
    async remove(id) {
        const heat = await this.findOne(id);
        await this.prisma.heat.delete({
            where: { id },
        });
        return { message: 'Heat deleted successfully' };
    }
    async autoAssign(autoAssignDto) {
        const { eventId, round, method, maxLanes = 20, heatsCount, finalistsCount, } = autoAssignDto;
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
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
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const eventName = this.getEventNameForRecords(event);
        const participants = event.registrationEvents.map((re) => {
            const athlete = re.registration.athlete;
            const personalBests = athlete.personalBests || {};
            const seasonBests = athlete.seasonBests || {};
            const personalBest = personalBests[eventName];
            const seasonBest = seasonBests[eventName];
            return {
                registrationId: re.registration.id,
                athlete,
                seedTime: re.seedTime,
                personalBest: personalBest?.result || null,
                seasonBest: seasonBest?.result || null,
            };
        });
        if (participants.length === 0) {
            throw new common_1.BadRequestException('No participants registered for this event');
        }
        await this.prisma.heat.deleteMany({
            where: {
                eventId,
                round: round,
            },
        });
        let heats = [];
        switch (method) {
            case auto_assign_dto_1.AssignmentMethodEnum.STRAIGHT_FINAL:
                heats = await this.createStraightFinal(eventId, round, participants, maxLanes);
                break;
            case auto_assign_dto_1.AssignmentMethodEnum.SEED_TIME:
                heats = await this.createSeedTimeHeats(eventId, round, participants, maxLanes, heatsCount);
                break;
            case auto_assign_dto_1.AssignmentMethodEnum.SERPENTINE:
                heats = await this.createSerpentineHeats(eventId, round, participants, maxLanes, heatsCount);
                break;
            case auto_assign_dto_1.AssignmentMethodEnum.RANDOM:
                heats = await this.createRandomHeats(eventId, round, participants, maxLanes, heatsCount);
                break;
            case auto_assign_dto_1.AssignmentMethodEnum.ALPHABETICAL_NUMBER:
            case auto_assign_dto_1.AssignmentMethodEnum.ALPHABETICAL_NAME:
            case auto_assign_dto_1.AssignmentMethodEnum.ROUND_ROBIN:
            case auto_assign_dto_1.AssignmentMethodEnum.ZIGZAG:
            case auto_assign_dto_1.AssignmentMethodEnum.BY_RESULT:
            case auto_assign_dto_1.AssignmentMethodEnum.BY_RESULT_INDOOR:
                throw new common_1.BadRequestException('Use advanced-auto-assign endpoint for this method');
                break;
            default:
                throw new common_1.BadRequestException('Invalid assignment method');
        }
        return {
            message: 'Athletes assigned successfully',
            heats: heats.length,
            participants: participants.length,
            method,
            heatsData: heats,
        };
    }
    async createStraightFinal(eventId, round, participants, maxLanes) {
        if (participants.length > maxLanes) {
            throw new common_1.BadRequestException(`Too many participants for straight final (max ${maxLanes})`);
        }
        const sortedParticipants = this.sortBySeedTime(participants);
        const laneAssignments = this.assignLanesForFinal(sortedParticipants, maxLanes);
        const heat = await this.prisma.heat.create({
            data: {
                eventId,
                heatNumber: 1,
                round: round,
                maxLanes,
                assignments: {
                    create: laneAssignments.map((assignment, index) => ({
                        registrationId: assignment.registrationId,
                        lane: assignment.lane,
                        seedTime: assignment.seedTime,
                        seedRank: index + 1,
                        assignmentMethod: client_1.AssignmentMethod.STRAIGHT_FINAL,
                    })),
                },
            },
            include: {
                assignments: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                },
            },
        });
        return [heat];
    }
    async createSeedTimeHeats(eventId, round, participants, maxLanes, heatsCount) {
        const sortedParticipants = this.sortBySeedTime(participants);
        const calculatedHeatsCount = heatsCount || Math.ceil(participants.length / maxLanes);
        const heats = [];
        for (let heatNum = 1; heatNum <= calculatedHeatsCount; heatNum++) {
            const startIndex = (heatNum - 1) * maxLanes;
            const endIndex = Math.min(startIndex + maxLanes, participants.length);
            const heatParticipants = sortedParticipants.slice(startIndex, endIndex);
            if (heatParticipants.length === 0)
                break;
            const laneAssignments = heatNum === calculatedHeatsCount
                ? this.assignLanesForFinal(heatParticipants, maxLanes)
                : heatParticipants.map((p, index) => ({ ...p, lane: index + 1 }));
            const heat = await this.prisma.heat.create({
                data: {
                    eventId,
                    heatNumber: heatNum,
                    round: round,
                    maxLanes,
                    assignments: {
                        create: laneAssignments.map((assignment, index) => ({
                            registrationId: assignment.registrationId,
                            lane: assignment.lane,
                            seedTime: assignment.seedTime,
                            seedRank: startIndex + index + 1,
                            assignmentMethod: client_1.AssignmentMethod.SEED_TIME,
                        })),
                    },
                },
                include: {
                    assignments: {
                        include: {
                            registration: {
                                include: {
                                    athlete: true,
                                },
                            },
                        },
                    },
                },
            });
            heats.push(heat);
        }
        return heats;
    }
    async createSerpentineHeats(eventId, round, participants, maxLanes, heatsCount) {
        const sortedParticipants = this.sortBySeedTime(participants);
        const calculatedHeatsCount = heatsCount || Math.ceil(participants.length / maxLanes);
        const heatGroups = Array.from({ length: calculatedHeatsCount }, () => []);
        let currentHeat = 0;
        let direction = 1;
        for (let i = 0; i < sortedParticipants.length; i++) {
            heatGroups[currentHeat].push(sortedParticipants[i]);
            if (direction === 1) {
                if (currentHeat === calculatedHeatsCount - 1) {
                    direction = -1;
                }
                else {
                    currentHeat++;
                }
            }
            else {
                if (currentHeat === 0) {
                    direction = 1;
                }
                else {
                    currentHeat--;
                }
            }
        }
        const heats = [];
        for (let heatNum = 0; heatNum < heatGroups.length; heatNum++) {
            const heatParticipants = heatGroups[heatNum];
            if (heatParticipants.length === 0)
                continue;
            const laneAssignments = this.assignLanesForFinal(heatParticipants, maxLanes);
            const heat = await this.prisma.heat.create({
                data: {
                    eventId,
                    heatNumber: heatNum + 1,
                    round: round,
                    maxLanes,
                    assignments: {
                        create: laneAssignments.map((assignment, index) => ({
                            registrationId: assignment.registrationId,
                            lane: assignment.lane,
                            seedTime: assignment.seedTime,
                            seedRank: sortedParticipants.findIndex((p) => p.registrationId === assignment.registrationId) + 1,
                            assignmentMethod: client_1.AssignmentMethod.SERPENTINE,
                        })),
                    },
                },
                include: {
                    assignments: {
                        include: {
                            registration: {
                                include: {
                                    athlete: true,
                                },
                            },
                        },
                    },
                },
            });
            heats.push(heat);
        }
        return heats;
    }
    async createRandomHeats(eventId, round, participants, maxLanes, heatsCount) {
        const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
        const calculatedHeatsCount = heatsCount || Math.ceil(participants.length / maxLanes);
        const heats = [];
        for (let heatNum = 1; heatNum <= calculatedHeatsCount; heatNum++) {
            const startIndex = (heatNum - 1) * maxLanes;
            const endIndex = Math.min(startIndex + maxLanes, shuffledParticipants.length);
            const heatParticipants = shuffledParticipants.slice(startIndex, endIndex);
            if (heatParticipants.length === 0)
                break;
            const heat = await this.prisma.heat.create({
                data: {
                    eventId,
                    heatNumber: heatNum,
                    round: round,
                    maxLanes,
                    assignments: {
                        create: heatParticipants.map((participant, index) => ({
                            registrationId: participant.registrationId,
                            lane: index + 1,
                            seedTime: participant.seedTime,
                            assignmentMethod: client_1.AssignmentMethod.RANDOM,
                        })),
                    },
                },
                include: {
                    assignments: {
                        include: {
                            registration: {
                                include: {
                                    athlete: true,
                                },
                            },
                        },
                    },
                },
            });
            heats.push(heat);
        }
        return heats;
    }
    sortBySeedTime(participants) {
        return participants.sort((a, b) => {
            const timeA = this.getBestAvailableTime(a);
            const timeB = this.getBestAvailableTime(b);
            if (!timeA && !timeB)
                return 0;
            if (!timeA)
                return 1;
            if (!timeB)
                return -1;
            const secondsA = this.convertTimeToSeconds(timeA);
            const secondsB = this.convertTimeToSeconds(timeB);
            return secondsA - secondsB;
        });
    }
    getBestAvailableTime(participant) {
        if (participant.seedTime)
            return participant.seedTime;
        if (participant.seasonBest)
            return participant.seasonBest;
        if (participant.personalBest)
            return participant.personalBest;
        return null;
    }
    assignLanesForFinal(participants, maxLanes) {
        const laneOrder = this.getFinalLaneOrder(maxLanes);
        return participants.map((participant, index) => ({
            ...participant,
            lane: laneOrder[index] || index + 1,
        }));
    }
    getFinalLaneOrder(maxLanes) {
        if (maxLanes === 8) {
            return [4, 5, 3, 6, 2, 7, 1, 8];
        }
        else if (maxLanes === 6) {
            return [3, 4, 2, 5, 1, 6];
        }
        else {
            const middle = Math.ceil(maxLanes / 2);
            const order = [middle];
            for (let i = 1; i < maxLanes; i++) {
                if (i % 2 === 1) {
                    order.push(middle + Math.ceil(i / 2));
                }
                else {
                    order.push(middle - i / 2);
                }
            }
            return order.filter((lane) => lane >= 1 && lane <= maxLanes);
        }
    }
    convertTimeToSeconds(timeString) {
        if (!timeString)
            return Infinity;
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
        return Infinity;
    }
    async getEventHeats(eventId) {
        const heats = await this.prisma.heat.findMany({
            where: { eventId },
            include: {
                event: true,
                assignments: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                    orderBy: {
                        lane: 'asc',
                    },
                },
            },
            orderBy: [{ round: 'asc' }, { heatNumber: 'asc' }],
        });
        return heats;
    }
    async advancedAutoAssign(advancedDto) {
        const { eventId, round, seriesMethod, laneMethod, maxLanes = 20, heatsCount, finalistsCount, } = advancedDto;
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
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
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const participants = event.registrationEvents.map((re) => ({
            registrationId: re.registration.id,
            athlete: re.registration.athlete,
            seedTime: re.seedTime,
            bibNumber: re.registration.bibNumber,
        }));
        if (participants.length === 0) {
            throw new common_1.BadRequestException('No participants registered for this event');
        }
        await this.prisma.heat.deleteMany({
            where: {
                eventId,
                round: round,
            },
        });
        const seriesGroups = this.divideIntoSeries(participants, seriesMethod, heatsCount, maxLanes);
        const heats = [];
        for (let seriesIndex = 0; seriesIndex < seriesGroups.length; seriesIndex++) {
            const seriesParticipants = seriesGroups[seriesIndex];
            if (seriesParticipants.length === 0)
                continue;
            const laneAssignments = this.assignLanes(seriesParticipants, laneMethod, maxLanes);
            const heat = await this.prisma.heat.create({
                data: {
                    eventId,
                    heatNumber: seriesIndex + 1,
                    round: round,
                    maxLanes,
                    assignments: {
                        create: laneAssignments.map((assignment, index) => ({
                            registrationId: assignment.registrationId,
                            lane: assignment.lane,
                            seedTime: assignment.seedTime,
                            seedRank: assignment.seedRank || index + 1,
                            assignmentMethod: laneMethod,
                        })),
                    },
                },
                include: {
                    assignments: {
                        include: {
                            registration: {
                                include: {
                                    athlete: true,
                                },
                            },
                        },
                    },
                },
            });
            heats.push(heat);
        }
        return {
            message: 'Advanced assignment completed successfully',
            heats: heats.length,
            participants: participants.length,
            seriesMethod,
            laneMethod,
            heatsData: heats,
        };
    }
    divideIntoSeries(participants, method, heatsCount, maxLanes = 8) {
        const calculatedHeatsCount = heatsCount || Math.ceil(participants.length / maxLanes);
        switch (method) {
            case auto_assign_dto_1.AssignmentMethodEnum.ALPHABETICAL_NUMBER:
                return this.divideAlphabeticallyByNumber(participants, calculatedHeatsCount);
            case auto_assign_dto_1.AssignmentMethodEnum.ALPHABETICAL_NAME:
                return this.divideAlphabeticallyByName(participants, calculatedHeatsCount);
            case auto_assign_dto_1.AssignmentMethodEnum.ROUND_ROBIN:
                return this.divideRoundRobin(participants, calculatedHeatsCount);
            case auto_assign_dto_1.AssignmentMethodEnum.ZIGZAG:
                return this.divideZigzag(participants, calculatedHeatsCount);
            case auto_assign_dto_1.AssignmentMethodEnum.BY_RESULT:
                return this.divideByResult(participants, calculatedHeatsCount);
            case auto_assign_dto_1.AssignmentMethodEnum.BY_RESULT_INDOOR:
                return this.divideByResultIndoor(participants, calculatedHeatsCount);
            case auto_assign_dto_1.AssignmentMethodEnum.SEED_TIME:
            default:
                return this.divideBySeedTime(participants, calculatedHeatsCount, maxLanes);
        }
    }
    divideAlphabeticallyByNumber(participants, heatsCount) {
        const sorted = [...participants].sort((a, b) => {
            const numA = parseInt(a.bibNumber || '999999');
            const numB = parseInt(b.bibNumber || '999999');
            return numA - numB;
        });
        return this.distributeEvenly(sorted, heatsCount);
    }
    divideAlphabeticallyByName(participants, heatsCount) {
        const sorted = [...participants].sort((a, b) => {
            const nameA = `${a.athlete.lastName} ${a.athlete.firstName}`.toLowerCase();
            const nameB = `${b.athlete.lastName} ${b.athlete.firstName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
        return this.distributeEvenly(sorted, heatsCount);
    }
    divideRoundRobin(participants, heatsCount) {
        const groups = Array.from({ length: heatsCount }, () => []);
        participants.forEach((participant, index) => {
            const groupIndex = index % heatsCount;
            groups[groupIndex].push(participant);
        });
        return groups;
    }
    divideZigzag(participants, heatsCount) {
        const sortedParticipants = this.sortBySeedTime(participants);
        const groups = Array.from({ length: heatsCount }, () => []);
        let currentGroup = 0;
        let direction = 1;
        for (let i = 0; i < sortedParticipants.length; i++) {
            groups[currentGroup].push(sortedParticipants[i]);
            if (direction === 1) {
                if (currentGroup === heatsCount - 1) {
                    direction = -1;
                }
                else {
                    currentGroup++;
                }
            }
            else {
                if (currentGroup === 0) {
                    direction = 1;
                }
                else {
                    currentGroup--;
                }
            }
        }
        return groups;
    }
    divideByResult(participants, heatsCount) {
        const sortedParticipants = this.sortBySeedTime(participants);
        return this.distributeEvenly(sortedParticipants, heatsCount);
    }
    divideByResultIndoor(participants, heatsCount) {
        const sortedParticipants = this.sortBySeedTime(participants);
        const groups = Array.from({ length: heatsCount }, () => []);
        for (let i = 0; i < sortedParticipants.length; i += 2) {
            const groupIndex = Math.floor(i / 2) % heatsCount;
            groups[groupIndex].push(sortedParticipants[i]);
            if (i + 1 < sortedParticipants.length) {
                groups[groupIndex].push(sortedParticipants[i + 1]);
            }
        }
        return groups;
    }
    divideBySeedTime(participants, heatsCount, maxLanes) {
        const sortedParticipants = this.sortBySeedTime(participants);
        const groups = [];
        for (let i = 0; i < heatsCount; i++) {
            const startIndex = i * maxLanes;
            const endIndex = Math.min(startIndex + maxLanes, sortedParticipants.length);
            groups.push(sortedParticipants.slice(startIndex, endIndex));
        }
        return groups.filter((group) => group.length > 0);
    }
    assignLanes(participants, method, maxLanes) {
        switch (method) {
            case auto_assign_dto_1.AssignmentMethodEnum.BEST_TO_WORST:
                return this.assignLanesBestToWorst(participants);
            case auto_assign_dto_1.AssignmentMethodEnum.WORST_TO_BEST:
                return this.assignLanesWorstToBest(participants);
            case auto_assign_dto_1.AssignmentMethodEnum.HALF_AND_HALF:
                return this.assignLanesHalfAndHalf(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.PAIRS:
                return this.assignLanesPairs(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.PAIRS_INDOOR:
                return this.assignLanesPairsIndoor(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.STANDARD_OUTSIDE:
                return this.assignLanesStandardOutside(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.STANDARD_INSIDE:
                return this.assignLanesStandardInside(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.WATERFALL:
                return this.assignLanesWaterfall(participants);
            case auto_assign_dto_1.AssignmentMethodEnum.WATERFALL_REVERSE:
                return this.assignLanesWaterfallReverse(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.WA_HALVES_AND_PAIRS:
                return this.assignLanesWAHalvesAndPairs(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.WA_SPRINTS_STRAIGHT:
                return this.assignLanesWASprintsStraight(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.WA_200M:
                return this.assignLanesWA200M(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.WA_400M_800M:
                return this.assignLanesWA400M800M(participants, maxLanes);
            case auto_assign_dto_1.AssignmentMethodEnum.WA_9_LANES:
                return this.assignLanesWA9Lanes(participants);
            case auto_assign_dto_1.AssignmentMethodEnum.RANDOM:
                return this.assignLanesRandom(participants);
            default:
                return this.assignLanesForFinal(participants, maxLanes);
        }
    }
    assignLanesBestToWorst(participants) {
        const sorted = this.sortBySeedTime(participants);
        return sorted.map((participant, index) => ({
            ...participant,
            lane: index + 1,
            seedRank: index + 1,
        }));
    }
    assignLanesWorstToBest(participants) {
        const sorted = this.sortBySeedTime(participants).reverse();
        return sorted.map((participant, index) => ({
            ...participant,
            lane: index + 1,
            seedRank: participants.length - index,
        }));
    }
    assignLanesHalfAndHalf(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const best4 = sorted.slice(0, 4);
        const centerLanes = [3, 4, 5, 6];
        best4.forEach((participant, index) => {
            if (index < centerLanes.length) {
                assignments.push({
                    ...participant,
                    lane: centerLanes[index],
                    seedRank: index + 1,
                });
            }
        });
        const remaining = sorted.slice(4);
        const outerLanes = [1, 2, 7, 8];
        remaining.forEach((participant, index) => {
            if (index < outerLanes.length) {
                assignments.push({
                    ...participant,
                    lane: outerLanes[index],
                    seedRank: index + 5,
                });
            }
        });
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesPairs(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const pairLanes = [
            [4, 5],
            [3, 6],
            [2, 7],
            [1, 8],
        ];
        for (let i = 0; i < Math.min(sorted.length, 8); i += 2) {
            const pairIndex = Math.floor(i / 2);
            if (pairIndex < pairLanes.length) {
                const lanes = pairLanes[pairIndex];
                const shuffledLanes = Math.random() > 0.5 ? lanes : [lanes[1], lanes[0]];
                assignments.push({
                    ...sorted[i],
                    lane: shuffledLanes[0],
                    seedRank: i + 1,
                });
                if (i + 1 < sorted.length) {
                    assignments.push({
                        ...sorted[i + 1],
                        lane: shuffledLanes[1],
                        seedRank: i + 2,
                    });
                }
            }
        }
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesPairsIndoor(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const pairLanes = maxLanes <= 4
            ? [
                [1, 2],
                [3, 4],
            ]
            : [
                [5, 6],
                [3, 4],
                [1, 2],
            ];
        for (let i = 0; i < Math.min(sorted.length, maxLanes); i += 2) {
            const pairIndex = Math.floor(i / 2);
            if (pairIndex < pairLanes.length) {
                const lanes = pairLanes[pairIndex];
                assignments.push({
                    ...sorted[i],
                    lane: lanes[0],
                    seedRank: i + 1,
                });
                if (i + 1 < sorted.length) {
                    assignments.push({
                        ...sorted[i + 1],
                        lane: lanes[1],
                        seedRank: i + 2,
                    });
                }
            }
        }
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesStandardOutside(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const laneOrder = [1, 2, 3, 4, 5, 6, 7, 8];
        return sorted.map((participant, index) => ({
            ...participant,
            lane: laneOrder[index] || index + 1,
            seedRank: index + 1,
        }));
    }
    assignLanesStandardInside(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const laneOrder = [8, 7, 6, 5, 4, 3, 2, 1];
        return sorted.map((participant, index) => ({
            ...participant,
            lane: laneOrder[index] || maxLanes - index,
            seedRank: index + 1,
        }));
    }
    assignLanesWaterfall(participants) {
        const sorted = this.sortBySeedTime(participants);
        return sorted.map((participant, index) => ({
            ...participant,
            lane: index + 1,
            seedRank: index + 1,
        }));
    }
    assignLanesWaterfallReverse(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        return sorted.map((participant, index) => ({
            ...participant,
            lane: maxLanes - index,
            seedRank: index + 1,
        }));
    }
    assignLanesWAHalvesAndPairs(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const best4 = sorted.slice(0, 4);
        const centerLanes = [3, 4, 5, 6];
        best4.forEach((participant, index) => {
            assignments.push({
                ...participant,
                lane: centerLanes[index],
                seedRank: index + 1,
            });
        });
        const next2 = sorted.slice(4, 6);
        [7, 8].forEach((lane, index) => {
            if (index < next2.length) {
                assignments.push({
                    ...next2[index],
                    lane,
                    seedRank: index + 5,
                });
            }
        });
        const last2 = sorted.slice(6, 8);
        [1, 2].forEach((lane, index) => {
            if (index < last2.length) {
                assignments.push({
                    ...last2[index],
                    lane,
                    seedRank: index + 7,
                });
            }
        });
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesWASprintsStraight(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const best4 = sorted.slice(0, 4);
        const centerLanes = [3, 4, 5, 6];
        best4.forEach((participant, index) => {
            assignments.push({
                ...participant,
                lane: centerLanes[index],
                seedRank: index + 1,
            });
        });
        const next2 = sorted.slice(4, 6);
        [2, 7].forEach((lane, index) => {
            if (index < next2.length) {
                assignments.push({
                    ...next2[index],
                    lane,
                    seedRank: index + 5,
                });
            }
        });
        const last2 = sorted.slice(6, 8);
        [1, 8].forEach((lane, index) => {
            if (index < last2.length) {
                assignments.push({
                    ...last2[index],
                    lane,
                    seedRank: index + 7,
                });
            }
        });
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesWA200M(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const best3 = sorted.slice(0, 3);
        [5, 6, 7].forEach((lane, index) => {
            if (index < best3.length) {
                assignments.push({
                    ...best3[index],
                    lane,
                    seedRank: index + 1,
                });
            }
        });
        const next3 = sorted.slice(3, 6);
        [3, 4, 8].forEach((lane, index) => {
            if (index < next3.length) {
                assignments.push({
                    ...next3[index],
                    lane,
                    seedRank: index + 4,
                });
            }
        });
        const last2 = sorted.slice(6, 8);
        [1, 2].forEach((lane, index) => {
            if (index < last2.length) {
                assignments.push({
                    ...last2[index],
                    lane,
                    seedRank: index + 7,
                });
            }
        });
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesWA400M800M(participants, maxLanes) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const best4 = sorted.slice(0, 4);
        [4, 5, 6, 7].forEach((lane, index) => {
            if (index < best4.length) {
                assignments.push({
                    ...best4[index],
                    lane,
                    seedRank: index + 1,
                });
            }
        });
        const next2 = sorted.slice(4, 6);
        [3, 8].forEach((lane, index) => {
            if (index < next2.length) {
                assignments.push({
                    ...next2[index],
                    lane,
                    seedRank: index + 5,
                });
            }
        });
        const last2 = sorted.slice(6, 8);
        [1, 2].forEach((lane, index) => {
            if (index < last2.length) {
                assignments.push({
                    ...last2[index],
                    lane,
                    seedRank: index + 7,
                });
            }
        });
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesWA9Lanes(participants) {
        const sorted = this.sortBySeedTime(participants);
        const assignments = [];
        const best3 = sorted.slice(0, 3);
        [4, 5, 6].forEach((lane, index) => {
            if (index < best3.length) {
                assignments.push({
                    ...best3[index],
                    lane,
                    seedRank: index + 1,
                });
            }
        });
        const next2 = sorted.slice(3, 5);
        [3, 7].forEach((lane, index) => {
            if (index < next2.length) {
                assignments.push({
                    ...next2[index],
                    lane,
                    seedRank: index + 4,
                });
            }
        });
        const next2_2 = sorted.slice(5, 7);
        [2, 8].forEach((lane, index) => {
            if (index < next2_2.length) {
                assignments.push({
                    ...next2_2[index],
                    lane,
                    seedRank: index + 6,
                });
            }
        });
        const last2 = sorted.slice(7, 9);
        [1, 9].forEach((lane, index) => {
            if (index < last2.length) {
                assignments.push({
                    ...last2[index],
                    lane,
                    seedRank: index + 8,
                });
            }
        });
        return assignments.sort((a, b) => a.lane - b.lane);
    }
    assignLanesRandom(participants) {
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        return shuffled.map((participant, index) => ({
            ...participant,
            lane: index + 1,
            seedRank: participants.findIndex((p) => p.registrationId === participant.registrationId) + 1,
        }));
    }
    distributeEvenly(participants, heatsCount) {
        const groups = Array.from({ length: heatsCount }, () => []);
        const participantsPerHeat = Math.ceil(participants.length / heatsCount);
        for (let i = 0; i < participants.length; i++) {
            const groupIndex = Math.floor(i / participantsPerHeat);
            if (groupIndex < heatsCount) {
                groups[groupIndex].push(participants[i]);
            }
        }
        return groups.filter((group) => group.length > 0);
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
};
exports.HeatService = HeatService;
exports.HeatService = HeatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HeatService);
//# sourceMappingURL=heat.service.js.map