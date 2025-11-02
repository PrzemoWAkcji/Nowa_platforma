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
exports.CombinedEventsRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const create_event_dto_1 = require("../events/dto/create-event.dto");
const events_service_1 = require("../events/events.service");
const prisma_service_1 = require("../prisma/prisma.service");
const registrations_service_1 = require("../registrations/registrations.service");
const combined_events_service_1 = require("./combined-events.service");
const combined_events_types_1 = require("./types/combined-events.types");
let CombinedEventsRegistrationService = class CombinedEventsRegistrationService {
    prisma;
    combinedEventsService;
    eventsService;
    registrationsService;
    constructor(prisma, combinedEventsService, eventsService, registrationsService) {
        this.prisma = prisma;
        this.combinedEventsService = combinedEventsService;
        this.eventsService = eventsService;
        this.registrationsService = registrationsService;
    }
    async registerAthleteForCombinedEvent(dto) {
        const athlete = await this.prisma.athlete.findUnique({
            where: { id: dto.athleteId },
        });
        if (!athlete) {
            throw new common_1.NotFoundException('Zawodnik nie został znaleziony');
        }
        const competition = await this.prisma.competition.findUnique({
            where: { id: dto.competitionId },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Zawody nie zostały znalezione');
        }
        const existingCombinedEvent = await this.prisma.combinedEvent.findFirst({
            where: {
                athleteId: dto.athleteId,
                competitionId: dto.competitionId,
                eventType: dto.eventType,
            },
        });
        if (existingCombinedEvent) {
            throw new common_1.BadRequestException('Zawodnik jest już zarejestrowany na ten wielobój');
        }
        const combinedEvent = await this.combinedEventsService.createCombinedEvent({
            athleteId: dto.athleteId,
            competitionId: dto.competitionId,
            eventType: dto.eventType,
            gender: dto.gender,
        });
        if (dto.createSeparateEvents) {
            await this.createSeparateEventsForCombinedEvent(combinedEvent.id);
        }
        return combinedEvent;
    }
    async splitCombinedEventIntoSeparateEvents(dto) {
        const combinedEvent = await this.prisma.combinedEvent.findUnique({
            where: { id: dto.combinedEventId },
            include: {
                athlete: true,
                competition: true,
                results: true,
            },
        });
        if (!combinedEvent) {
            throw new common_1.NotFoundException('Wielobój nie został znaleziony');
        }
        const disciplines = this.combinedEventsService.getDisciplinesForEvent(combinedEvent.eventType, combinedEvent.gender);
        const createdEvents = [];
        const createdRegistrations = [];
        for (const discipline of disciplines) {
            const eventName = this.getDisciplineEventName(discipline, combinedEvent.eventType);
            const eventType = this.getDisciplineEventType(discipline);
            const event = await this.eventsService.create({
                name: eventName,
                type: eventType,
                gender: combinedEvent.gender,
                category: combinedEvent.athlete.category,
                unit: this.getDisciplineUnit(discipline),
                competitionId: combinedEvent.competitionId,
                distance: this.getDisciplineDistance(discipline),
                discipline: this.getDisciplineName(discipline),
            });
            createdEvents.push(event);
            if (dto.createRegistrations) {
                const user = await this.prisma.user.findFirst({
                    where: {
                        OR: [
                            { id: combinedEvent.athlete.coachId || '' },
                            {
                                email: `${combinedEvent.athlete.firstName.toLowerCase()}.${combinedEvent.athlete.lastName.toLowerCase()}@athletics.pl`,
                            },
                        ],
                    },
                });
                if (user) {
                    const registration = await this.registrationsService.create({
                        athleteId: combinedEvent.athleteId,
                        competitionId: combinedEvent.competitionId,
                        eventIds: [event.id],
                        notes: `Automatycznie utworzone z wieloboju ${combinedEvent.eventType}`,
                    }, user.id);
                    createdRegistrations.push(registration);
                }
            }
        }
        return {
            combinedEvent,
            createdEvents,
            createdRegistrations,
            message: `Utworzono ${createdEvents.length} konkurencji z wieloboju ${combinedEvent.eventType}`,
        };
    }
    async createSeparateEventsForCombinedEvent(combinedEventId) {
        return this.splitCombinedEventIntoSeparateEvents({
            combinedEventId,
            createRegistrations: true,
        });
    }
    async getCombinedEventRegistrations(competitionId) {
        const combinedEvents = await this.prisma.combinedEvent.findMany({
            where: { competitionId },
            include: {
                athlete: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        club: true,
                        category: true,
                        gender: true,
                    },
                },
                results: true,
            },
            orderBy: [{ eventType: 'asc' }, { athlete: { lastName: 'asc' } }],
        });
        return combinedEvents.map((ce) => ({
            id: ce.id,
            eventType: ce.eventType,
            athlete: ce.athlete,
            totalPoints: ce.totalPoints,
            isComplete: ce.isComplete,
            resultsCount: ce.results.length,
            completedDisciplines: ce.results.filter((r) => r.isValid).length,
            totalDisciplines: ce.results.length,
        }));
    }
    async bulkRegisterAthletesForCombinedEvent(dto) {
        const results = [];
        const errors = [];
        for (const athleteId of dto.athleteIds) {
            try {
                const result = await this.registerAthleteForCombinedEvent({
                    athleteId,
                    competitionId: dto.competitionId,
                    eventType: dto.eventType,
                    gender: dto.gender,
                    createSeparateEvents: dto.createSeparateEvents,
                });
                results.push(result);
            }
            catch (error) {
                errors.push({
                    athleteId,
                    error: error.message,
                });
            }
        }
        return {
            successful: results,
            errors,
            summary: {
                total: dto.athleteIds.length,
                successful: results.length,
                failed: errors.length,
            },
        };
    }
    getDisciplineEventName(discipline, eventType) {
        const disciplineNames = {
            '100M': '100m',
            '200M': '200m',
            '400M': '400m',
            '800M': '800m',
            '1000M': '1000m',
            '1500M': '1500m',
            '110H': '110m ppł',
            '100H': '100m ppł',
            '80H': '80m ppł',
            '60H': '60m ppł',
            HJ: 'Skok wzwyż',
            LJ: 'Skok w dal',
            PV: 'Skok o tyczce',
            SP: 'Pchnięcie kulą',
            DT: 'Rzut dyskiem',
            JT: 'Rzut oszczepem',
            HT: 'Rzut młotem',
        };
        const baseName = disciplineNames[discipline] || discipline;
        return `${baseName} (${eventType})`;
    }
    getDisciplineEventType(discipline) {
        if ([
            '100M',
            '200M',
            '400M',
            '800M',
            '1000M',
            '1500M',
            '110H',
            '100H',
            '80H',
            '60H',
        ].includes(discipline)) {
            return create_event_dto_1.EventType.TRACK;
        }
        return create_event_dto_1.EventType.FIELD;
    }
    getDisciplineUnit(discipline) {
        if ([
            '100M',
            '200M',
            '400M',
            '800M',
            '1000M',
            '1500M',
            '110H',
            '100H',
            '80H',
            '60H',
        ].includes(discipline)) {
            return create_event_dto_1.Unit.TIME;
        }
        if (['HJ', 'PV'].includes(discipline)) {
            return create_event_dto_1.Unit.HEIGHT;
        }
        return create_event_dto_1.Unit.DISTANCE;
    }
    getDisciplineDistance(discipline) {
        const distances = {
            '100M': '100m',
            '200M': '200m',
            '400M': '400m',
            '800M': '800m',
            '1000M': '1000m',
            '1500M': '1500m',
            '110H': '110m',
            '100H': '100m',
            '80H': '80m',
            '60H': '60m',
        };
        return distances[discipline] || undefined;
    }
    getDisciplineName(discipline) {
        const names = {
            '100M': 'sprint',
            '200M': 'sprint',
            '400M': 'sprint',
            '800M': 'distance',
            '1000M': 'distance',
            '1500M': 'distance',
            '110H': 'hurdles',
            '100H': 'hurdles',
            '80H': 'hurdles',
            '60H': 'hurdles',
            HJ: 'jump',
            LJ: 'jump',
            PV: 'jump',
            SP: 'throw',
            DT: 'throw',
            JT: 'throw',
            HT: 'throw',
        };
        return names[discipline] || 'combined';
    }
    getHurdleHeight(discipline, category) {
        if (!['110H', '100H', '80H', '60H'].includes(discipline))
            return undefined;
        const heights = {
            '110H': '1.067m',
            '100H': '0.84m',
            '80H': '0.76m',
            '60H': '0.84m',
        };
        return heights[discipline] || undefined;
    }
    getImplementWeight(discipline, category) {
        if (!['SP', 'DT', 'JT', 'HT'].includes(discipline))
            return undefined;
        const weights = {
            SP: '7.26kg',
            DT: '2kg',
            JT: '800g',
            HT: '7.26kg',
        };
        return weights[discipline] || undefined;
    }
    async generateIndividualEventsFromCombinedEvents(dto) {
        const { competitionId, combinedEventIds, createRegistrations = true, overwriteExisting = false, } = dto;
        const competition = await this.prisma.competition.findUnique({
            where: { id: competitionId },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Zawody nie zostały znalezione');
        }
        const combinedEvents = await this.prisma.event.findMany({
            where: {
                id: { in: combinedEventIds },
                competitionId,
                type: 'COMBINED',
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
        });
        if (combinedEvents.length === 0) {
            throw new common_1.NotFoundException('Nie znaleziono konkurencji wielobojowych');
        }
        const results = {
            processedEvents: [],
            createdEvents: [],
            createdRegistrations: [],
            errors: [],
            summary: {
                totalCombinedEvents: combinedEvents.length,
                totalAthletes: 0,
                totalCreatedEvents: 0,
                totalCreatedRegistrations: 0,
            },
        };
        for (const combinedEvent of combinedEvents) {
            try {
                const eventType = this.determineCombinedEventType(combinedEvent.name, combinedEvent.gender);
                if (!eventType) {
                    results.errors.push({
                        eventId: combinedEvent.id,
                        eventName: combinedEvent.name,
                        error: 'Nie można określić typu wieloboju na podstawie nazwy',
                    });
                    continue;
                }
                const disciplines = this.combinedEventsService.getDisciplinesForEvent(eventType, combinedEvent.gender);
                const registeredAthletes = combinedEvent.registrationEvents.map((re) => re.registration);
                if (registeredAthletes.length === 0) {
                    results.errors.push({
                        eventId: combinedEvent.id,
                        eventName: combinedEvent.name,
                        error: 'Brak zarejestrowanych zawodników',
                    });
                    continue;
                }
                results.summary.totalAthletes += registeredAthletes.length;
                const eventResults = {
                    combinedEventId: combinedEvent.id,
                    combinedEventName: combinedEvent.name,
                    athletesCount: registeredAthletes.length,
                    createdEvents: [],
                    createdRegistrations: [],
                };
                for (const discipline of disciplines) {
                    const eventName = this.getDisciplineEventName(discipline, eventType);
                    const eventType_field = this.getDisciplineEventType(discipline);
                    const existingEvent = await this.prisma.event.findFirst({
                        where: {
                            competitionId,
                            name: eventName,
                            gender: combinedEvent.gender,
                            category: combinedEvent.category,
                        },
                    });
                    let event;
                    if (existingEvent && !overwriteExisting) {
                        event = existingEvent;
                    }
                    else {
                        const eventData = {
                            name: eventName,
                            type: eventType_field,
                            gender: combinedEvent.gender,
                            category: combinedEvent.category,
                            unit: this.getDisciplineUnit(discipline),
                            competitionId,
                            distance: this.getDisciplineDistance(discipline),
                            discipline: this.getDisciplineName(discipline),
                            hurdleHeight: this.getHurdleHeight(discipline, combinedEvent.category),
                            implementWeight: this.getImplementWeight(discipline, combinedEvent.category),
                        };
                        if (existingEvent && overwriteExisting) {
                            event = await this.prisma.event.update({
                                where: { id: existingEvent.id },
                                data: eventData,
                            });
                        }
                        else {
                            event = await this.eventsService.create(eventData);
                        }
                        eventResults.createdEvents.push(event);
                        results.createdEvents.push(event);
                        results.summary.totalCreatedEvents++;
                    }
                    if (createRegistrations) {
                        for (const registration of registeredAthletes) {
                            try {
                                const existingRegistration = await this.prisma.registrationEvent.findFirst({
                                    where: {
                                        registration: {
                                            athleteId: registration.athleteId,
                                            competitionId,
                                        },
                                        eventId: event.id,
                                    },
                                });
                                if (!existingRegistration) {
                                    const newRegistrationEvent = await this.prisma.registrationEvent.create({
                                        data: {
                                            registrationId: registration.id,
                                            eventId: event.id,
                                            seedTime: null,
                                        },
                                    });
                                    eventResults.createdRegistrations.push({
                                        athlete: registration.athlete,
                                        event: event,
                                        registrationEvent: newRegistrationEvent,
                                    });
                                    results.createdRegistrations.push(newRegistrationEvent);
                                    results.summary.totalCreatedRegistrations++;
                                }
                            }
                            catch (regError) {
                                results.errors.push({
                                    eventId: combinedEvent.id,
                                    athleteId: registration.athleteId,
                                    athleteName: `${registration.athlete.firstName} ${registration.athlete.lastName}`,
                                    eventName: event.name,
                                    error: `Błąd podczas tworzenia rejestracji: ${regError.message}`,
                                });
                            }
                        }
                    }
                }
                results.processedEvents.push(eventResults);
            }
            catch (error) {
                results.errors.push({
                    eventId: combinedEvent.id,
                    eventName: combinedEvent.name,
                    error: `Błąd podczas przetwarzania: ${error.message}`,
                });
            }
        }
        return {
            ...results,
            message: `Przetworzono ${results.processedEvents.length} wielobojów. Utworzono ${results.summary.totalCreatedEvents} konkurencji i ${results.summary.totalCreatedRegistrations} rejestracji.`,
        };
    }
    determineCombinedEventType(eventName, gender) {
        const name = eventName.toLowerCase();
        if (name.includes('pięciobój') || name.includes('pentathlon')) {
            if (name.includes('u16') || name.includes('16')) {
                return gender === 'MALE'
                    ? combined_events_types_1.CombinedEventType.PENTATHLON_U16_MALE
                    : combined_events_types_1.CombinedEventType.PENTATHLON_U16_FEMALE;
            }
            if (name.includes('indoor') || name.includes('hala')) {
                return combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR;
            }
            return combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR;
        }
        if (name.includes('siedmiobój') || name.includes('heptathlon')) {
            return combined_events_types_1.CombinedEventType.HEPTATHLON;
        }
        if (name.includes('dziesięciobój') || name.includes('decathlon')) {
            return combined_events_types_1.CombinedEventType.DECATHLON;
        }
        return null;
    }
    async getCombinedEventsForGeneration(competitionId) {
        const combinedEvents = await this.prisma.event.findMany({
            where: {
                competitionId,
                type: 'COMBINED',
            },
            include: {
                registrationEvents: {
                    include: {
                        registration: {
                            include: {
                                athlete: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        gender: true,
                                        category: true,
                                        club: true,
                                    },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        registrationEvents: true,
                    },
                },
            },
            orderBy: [{ gender: 'asc' }, { name: 'asc' }],
        });
        return combinedEvents.map((event) => ({
            id: event.id,
            name: event.name,
            gender: event.gender,
            category: event.category,
            athletesCount: event._count.registrationEvents,
            athletes: event.registrationEvents.map((re) => ({
                id: re.registration.athlete.id,
                firstName: re.registration.athlete.firstName,
                lastName: re.registration.athlete.lastName,
                gender: re.registration.athlete.gender,
                category: re.registration.athlete.category,
                club: re.registration.athlete.club,
            })),
            canGenerate: event._count.registrationEvents > 0,
            estimatedEventType: this.determineCombinedEventType(event.name, event.gender),
        }));
    }
};
exports.CombinedEventsRegistrationService = CombinedEventsRegistrationService;
exports.CombinedEventsRegistrationService = CombinedEventsRegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        combined_events_service_1.CombinedEventsService,
        events_service_1.EventsService,
        registrations_service_1.RegistrationsService])
], CombinedEventsRegistrationService);
//# sourceMappingURL=combined-events-registration.service.js.map