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
var RegistrationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RegistrationsService = RegistrationsService_1 = class RegistrationsService {
    prisma;
    logger = new common_1.Logger(RegistrationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRegistrationDto, userId) {
        const { athleteId, competitionId, eventIds, ...registrationData } = createRegistrationDto;
        const athlete = await this.prisma.athlete.findUnique({
            where: { id: athleteId },
        });
        if (!athlete) {
            throw new common_1.NotFoundException('Athlete not found');
        }
        await this.validateAthleteCredentials(athlete);
        const competition = await this.prisma.competition.findUnique({
            where: { id: competitionId },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Competition not found');
        }
        const now = new Date();
        if (competition.registrationStartDate &&
            now < competition.registrationStartDate) {
            throw new common_1.BadRequestException('Registration has not started yet');
        }
        if (competition.registrationEndDate &&
            now > competition.registrationEndDate) {
            if (!competition.allowLateRegistration) {
                throw new common_1.BadRequestException('Registration has ended');
            }
        }
        const existingRegistration = await this.prisma.registration.findUnique({
            where: {
                athleteId_competitionId: {
                    athleteId,
                    competitionId,
                },
            },
        });
        if (existingRegistration) {
            throw new common_1.BadRequestException('Athlete is already registered for this competition');
        }
        const events = await this.prisma.event.findMany({
            where: {
                id: { in: eventIds },
                competitionId,
            },
        });
        if (events.length !== eventIds.length) {
            throw new common_1.BadRequestException('Some events do not exist or do not belong to this competition');
        }
        for (const event of events) {
            if (event.maxParticipants) {
                const currentRegistrations = await this.prisma.registrationEvent.count({
                    where: { eventId: event.id },
                });
                if (currentRegistrations >= event.maxParticipants) {
                    throw new common_1.BadRequestException(`Event "${event.name}" is full`);
                }
            }
        }
        return this.prisma.registration.create({
            data: {
                athleteId,
                competitionId,
                userId,
                ...registrationData,
                events: {
                    create: eventIds.map((eventId) => ({
                        eventId,
                        seedTime: registrationData.seedTime,
                    })),
                },
            },
            include: {
                athlete: true,
                competition: true,
                events: {
                    include: {
                        event: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.registration.findMany({
            include: {
                athlete: true,
                competition: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        location: true,
                    },
                },
                events: {
                    include: {
                        event: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
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
        return this.prisma.registration.findMany({
            where: { competitionId },
            include: {
                athlete: true,
                events: {
                    include: {
                        event: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async findByCompetitionAndEvent(competitionId, eventId) {
        return this.prisma.registration.findMany({
            where: {
                competitionId,
                events: {
                    some: {
                        eventId: eventId,
                    },
                },
            },
            include: {
                athlete: true,
                events: {
                    where: {
                        eventId: eventId,
                    },
                    include: {
                        event: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async getStartListSortedByRecords(competitionId, eventId, sortBy = 'PB') {
        const registrations = await this.findByCompetitionAndEvent(competitionId, eventId);
        if (registrations.length === 0) {
            return [];
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { name: true, type: true },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const eventName = this.getEventNameForRecords(event);
        const enrichedRegistrations = await Promise.all(registrations.map(async (registration) => {
            const athlete = registration.athlete;
            const personalBests = athlete.personalBests || {};
            const seasonBests = athlete.seasonBests || {};
            const personalBest = personalBests[eventName];
            const seasonBest = seasonBests[eventName];
            const seedTime = registration.events[0]?.seedTime;
            return {
                ...registration,
                records: {
                    personalBest,
                    seasonBest,
                    seedTime,
                },
            };
        }));
        const sortedRegistrations = enrichedRegistrations.sort((a, b) => {
            let aValue = null;
            let bValue = null;
            switch (sortBy) {
                case 'PB':
                    aValue = a.records.personalBest?.result || null;
                    bValue = b.records.personalBest?.result || null;
                    break;
                case 'SB':
                    aValue = a.records.seasonBest?.result || null;
                    bValue = b.records.seasonBest?.result || null;
                    break;
                case 'SEED_TIME':
                    aValue = a.records.seedTime || null;
                    bValue = b.records.seedTime || null;
                    break;
            }
            if (!aValue && !bValue)
                return 0;
            if (!aValue)
                return 1;
            if (!bValue)
                return -1;
            const isTimeEvent = this.isTimeBasedEvent(eventName);
            if (isTimeEvent) {
                return (this.parseTimeToSeconds(aValue) - this.parseTimeToSeconds(bValue));
            }
            else {
                return parseFloat(bValue) - parseFloat(aValue);
            }
        });
        return sortedRegistrations;
    }
    async findByAthlete(athleteId) {
        return this.prisma.registration.findMany({
            where: { athleteId },
            include: {
                competition: true,
                events: {
                    include: {
                        event: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.registration.findMany({
            where: { userId },
            include: {
                athlete: true,
                competition: true,
                events: {
                    include: {
                        event: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const registration = await this.prisma.registration.findUnique({
            where: { id },
            include: {
                athlete: true,
                competition: true,
                events: {
                    include: {
                        event: true,
                    },
                },
                results: {
                    include: {
                        event: true,
                    },
                },
            },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        return registration;
    }
    async update(id, updateRegistrationDto) {
        this.logger.debug(`Updating registration: ${id}`);
        const registration = await this.prisma.registration.findUnique({
            where: { id },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        const { eventIds, ...updateData } = updateRegistrationDto;
        if (eventIds) {
            await this.prisma.registrationEvent.deleteMany({
                where: { registrationId: id },
            });
            await this.prisma.registrationEvent.createMany({
                data: eventIds.map((eventId) => ({
                    registrationId: id,
                    eventId,
                    seedTime: updateData.seedTime,
                })),
            });
        }
        const updatedRegistration = await this.prisma.registration.update({
            where: { id },
            data: updateData,
            include: {
                athlete: true,
                competition: true,
                events: {
                    include: {
                        event: true,
                    },
                },
            },
        });
        this.logger.log(`Registration updated successfully: ${id}`);
        return updatedRegistration;
    }
    async remove(id) {
        const registration = await this.prisma.registration.findUnique({
            where: { id },
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        return this.prisma.registration.delete({
            where: { id },
        });
    }
    async confirmRegistration(id) {
        return this.prisma.registration.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
                paymentStatus: 'COMPLETED',
                paymentDate: new Date(),
            },
            include: {
                athlete: true,
                competition: true,
                events: {
                    include: {
                        event: true,
                    },
                },
            },
        });
    }
    async cancelRegistration(id) {
        return this.update(id, {
            status: 'CANCELLED',
        });
    }
    async rejectRegistration(id) {
        return this.prisma.registration.update({
            where: { id },
            data: {
                status: 'REJECTED',
            },
            include: {
                athlete: true,
                competition: true,
                events: {
                    include: {
                        event: true,
                    },
                },
            },
        });
    }
    async assignBibNumbers(competitionId, startingNumber = 1) {
        const registrations = await this.prisma.registration.findMany({
            where: {
                competitionId,
                status: 'CONFIRMED',
                bibNumber: null,
            },
            include: {
                athlete: true,
            },
            orderBy: [
                { athlete: { lastName: 'asc' } },
                { athlete: { firstName: 'asc' } },
            ],
        });
        if (registrations.length === 0) {
            return {
                message: 'Brak rejestracji do przydzielenia numerów startowych',
                assigned: 0,
            };
        }
        const existingRegistrations = await this.prisma.registration.findMany({
            where: {
                competitionId,
                bibNumber: { not: null },
            },
            select: { bibNumber: true },
        });
        const existingNumbers = existingRegistrations
            .map((r) => parseInt(r.bibNumber || '0'))
            .filter((n) => !isNaN(n));
        const maxExistingNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        let currentNumber = Math.max(startingNumber, maxExistingNumber + 1);
        const updates = [];
        for (const registration of registrations) {
            updates.push(this.prisma.registration.update({
                where: { id: registration.id },
                data: { bibNumber: currentNumber.toString() },
            }));
            currentNumber++;
        }
        await Promise.all(updates);
        return {
            message: `Przydzielono numery startowe dla ${registrations.length} zawodników`,
            assigned: registrations.length,
            startingNumber: Math.max(startingNumber, maxExistingNumber + 1),
            endingNumber: currentNumber - 1,
        };
    }
    async validateAthleteCredentials(athlete) {
        const errors = [];
        if (!athlete.licenseNumber) {
            errors.push('Zawodnik nie posiada numeru licencji');
        }
        if (athlete.isParaAthlete && !athlete.classification) {
            errors.push('Zawodnik para-atletyczny musi mieć przydzieloną klasyfikację');
        }
        if (!athlete.dateOfBirth) {
            errors.push('Brak daty urodzenia zawodnika');
        }
        if (!athlete.nationality) {
            errors.push('Brak informacji o narodowości zawodnika');
        }
        if (athlete.dateOfBirth) {
            const age = this.calculateAge(new Date(athlete.dateOfBirth));
            if (age < 16) {
                errors.push('Zawodnik jest za młody do udziału w zawodach (minimum 16 lat)');
            }
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException(`Błędy walidacji zawodnika: ${errors.join(', ')}`);
        }
    }
    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    async getRegistrationStatistics(competitionId) {
        const where = competitionId ? { competitionId } : {};
        const totalRegistrations = await this.prisma.registration.count({ where });
        const statusCounts = await this.prisma.registration.groupBy({
            by: ['status'],
            where,
            _count: true,
        });
        const paymentCounts = await this.prisma.registration.groupBy({
            by: ['paymentStatus'],
            where,
            _count: true,
        });
        return {
            totalRegistrations,
            statusDistribution: statusCounts.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            paymentDistribution: paymentCounts.reduce((acc, item) => {
                acc[item.paymentStatus] = item._count;
                return acc;
            }, {}),
        };
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
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = RegistrationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map