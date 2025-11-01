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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ScheduleService = class ScheduleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createScheduleDto) {
        const { competitionId, name, description, isPublished, items } = createScheduleDto;
        const competition = await this.prisma.competition.findUnique({
            where: { id: competitionId },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Competition not found');
        }
        const eventIds = items.map((item) => item.eventId);
        const events = await this.prisma.event.findMany({
            where: {
                id: { in: eventIds },
                competitionId: competitionId,
            },
        });
        if (events.length !== eventIds.length) {
            throw new common_1.BadRequestException('Some events do not exist or do not belong to this competition');
        }
        const schedule = await this.prisma.competitionSchedule.create({
            data: {
                competitionId,
                name,
                description,
                isPublished: isPublished || false,
                items: {
                    create: items.map((item) => ({
                        eventId: item.eventId,
                        scheduledTime: new Date(item.scheduledTime),
                        actualTime: item.actualTime ? new Date(item.actualTime) : null,
                        duration: item.duration,
                        round: item.round,
                        seriesCount: item.seriesCount || 1,
                        finalistsCount: item.finalistsCount,
                        notes: item.notes,
                        status: client_1.ScheduleStatus.SCHEDULED,
                    })),
                },
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
        return schedule;
    }
    async findAll(competitionId) {
        const where = competitionId ? { competitionId } : {};
        return this.prisma.competitionSchedule.findMany({
            where,
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
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const schedule = await this.prisma.competitionSchedule.findUnique({
            where: { id },
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
            throw new common_1.NotFoundException('Schedule not found');
        }
        return schedule;
    }
    async update(id, updateScheduleDto) {
        await this.findOne(id);
        const { items, ...scheduleData } = updateScheduleDto;
        await this.prisma.competitionSchedule.update({
            where: { id },
            data: scheduleData,
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
        if (items) {
            await this.prisma.scheduleItem.deleteMany({
                where: { scheduleId: id },
            });
            await this.prisma.scheduleItem.createMany({
                data: items.map((item) => ({
                    scheduleId: id,
                    eventId: item.eventId,
                    scheduledTime: new Date(item.scheduledTime),
                    actualTime: item.actualTime ? new Date(item.actualTime) : null,
                    duration: item.duration,
                    round: item.round,
                    seriesCount: item.seriesCount || 1,
                    finalistsCount: item.finalistsCount,
                    notes: item.notes,
                    status: client_1.ScheduleStatus.SCHEDULED,
                })),
            });
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.competitionSchedule.delete({
            where: { id },
        });
        return { message: 'Schedule deleted successfully' };
    }
    async publish(id) {
        await this.findOne(id);
        return this.prisma.competitionSchedule.update({
            where: { id },
            data: { isPublished: true },
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
    }
    async unpublish(id) {
        await this.findOne(id);
        return this.prisma.competitionSchedule.update({
            where: { id },
            data: { isPublished: false },
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
    }
    async updateItemStatus(scheduleId, itemId, status) {
        const item = await this.prisma.scheduleItem.findFirst({
            where: {
                id: itemId,
                scheduleId: scheduleId,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Schedule item not found');
        }
        return this.prisma.scheduleItem.update({
            where: { id: itemId },
            data: {
                status,
                actualTime: status === client_1.ScheduleStatus.IN_PROGRESS ? new Date() : item.actualTime,
            },
            include: {
                event: true,
            },
        });
    }
    async getEventParticipants(eventId) {
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
        return {
            event,
            participants: event.registrationEvents.map((re) => ({
                registration: re.registration,
                athlete: re.registration.athlete,
                seedTime: re.seedTime,
            })),
            totalParticipants: event.registrationEvents.length,
        };
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map