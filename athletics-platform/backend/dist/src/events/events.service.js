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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const equipment_service_1 = require("../equipment/equipment.service");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsService = EventsService_1 = class EventsService {
    prisma;
    equipmentService;
    logger = new common_1.Logger(EventsService_1.name);
    constructor(prisma, equipmentService) {
        this.prisma = prisma;
        this.equipmentService = equipmentService;
    }
    formatScheduledTime(scheduledTime) {
        let timeString = scheduledTime;
        if (timeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            timeString += ':00';
        }
        const formattedDate = new Date(timeString);
        if (isNaN(formattedDate.getTime())) {
            throw new Error(`Invalid scheduledTime format: ${scheduledTime}. Expected ISO-8601 DateTime format.`);
        }
        return formattedDate;
    }
    async create(createEventDto) {
        this.logger.debug(`Creating event: ${createEventDto.name} for competition: ${createEventDto.competitionId}`);
        const competition = await this.prisma.competition.findUnique({
            where: { id: createEventDto.competitionId },
        });
        if (!competition) {
            this.logger.error(`Competition not found: ${createEventDto.competitionId}`);
            throw new common_1.NotFoundException('Competition not found');
        }
        this.logger.debug(`Competition found: ${competition.name}`);
        const equipmentSpecs = this.equipmentService.getEquipmentSpecs(createEventDto.category, createEventDto.discipline || createEventDto.name, createEventDto.gender);
        this.logger.debug(`Equipment specs retrieved for event: ${createEventDto.name}`);
        let formattedScheduledTime;
        if (createEventDto.scheduledTime) {
            formattedScheduledTime = this.formatScheduledTime(createEventDto.scheduledTime);
        }
        const eventData = {
            ...createEventDto,
            scheduledTime: formattedScheduledTime,
            seedTimeRequired: createEventDto.seedTimeRequired || false,
            hurdleHeight: equipmentSpecs.hurdleHeight,
            implementWeight: equipmentSpecs.implementWeight,
            implementSpecs: equipmentSpecs.implementSpecs,
        };
        try {
            const result = await this.prisma.event.create({
                data: eventData,
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
            });
            this.logger.log(`Event created successfully: ${result.id} - ${result.name}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error creating event: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAll() {
        return this.prisma.event.findMany({
            include: {
                competition: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        location: true,
                    },
                },
                _count: {
                    select: {
                        registrationEvents: true,
                        results: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findByCompetition(competitionId) {
        return this.prisma.event.findMany({
            where: { competitionId },
            include: {
                _count: {
                    select: {
                        registrationEvents: true,
                        results: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findByType(type) {
        const validTypes = ['TRACK', 'FIELD', 'ROAD', 'COMBINED', 'RELAY'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid event type value: ${type}`);
        }
        return this.prisma.event.findMany({
            where: { type: type },
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
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findByCategory(category) {
        const validCategories = this.equipmentService.getAllCategories();
        if (!validCategories.includes(category)) {
            throw new Error(`Invalid category value: ${category}`);
        }
        return this.prisma.event.findMany({
            where: { category: category },
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
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findOne(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                competition: true,
                registrationEvents: {
                    include: {
                        registration: {
                            include: {
                                athlete: true,
                            },
                        },
                    },
                },
                results: {
                    include: {
                        athlete: true,
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async update(id, updateEventDto) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const updateData = { ...updateEventDto };
        if (updateEventDto.scheduledTime) {
            updateData.scheduledTime = this.formatScheduledTime(updateEventDto.scheduledTime);
        }
        return this.prisma.event.update({
            where: { id },
            data: updateData,
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
        });
    }
    async remove(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return this.prisma.event.delete({
            where: { id },
        });
    }
    async getEventStatistics(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
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
                results: {
                    include: {
                        athlete: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const totalRegistrations = event.registrationEvents.length;
        const totalResults = event.results.length;
        const completionRate = totalRegistrations > 0 ? (totalResults / totalRegistrations) * 100 : 0;
        const genderDistribution = event.registrationEvents.reduce((acc, regEvent) => {
            const gender = regEvent.registration.athlete.gender;
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});
        const categoryDistribution = event.registrationEvents.reduce((acc, regEvent) => {
            const category = regEvent.registration.athlete.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        return {
            event,
            statistics: {
                totalRegistrations,
                totalResults,
                completionRate: Math.round(completionRate * 100) / 100,
                genderDistribution,
                categoryDistribution,
                maxParticipants: event.maxParticipants,
                spotsRemaining: event.maxParticipants
                    ? event.maxParticipants - totalRegistrations
                    : null,
            },
        };
    }
    async markAsCompleted(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return this.prisma.event.update({
            where: { id },
            data: { isCompleted: true },
        });
    }
    async markAsOngoing(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return this.prisma.event.update({
            where: { id },
            data: { isCompleted: false },
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        equipment_service_1.EquipmentService])
], EventsService);
//# sourceMappingURL=events.service.js.map