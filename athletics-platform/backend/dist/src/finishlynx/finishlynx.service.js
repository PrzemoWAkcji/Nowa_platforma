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
var FinishlynxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinishlynxService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinishlynxService = FinishlynxService_1 = class FinishlynxService {
    prisma;
    logger = new common_1.Logger(FinishlynxService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importFromFile(importFileDto) {
        const { fileType, fileContent, competitionId } = importFileDto;
        try {
            switch (fileType) {
                case 'evt':
                    return await this.parseEvtFile(fileContent, competitionId);
                case 'lif':
                    return await this.parseLifFile(fileContent, competitionId);
                case 'sch':
                    return this.parseSchFile(fileContent);
                default:
                    throw new common_1.BadRequestException('Nieobsługiwany typ pliku');
            }
        }
        catch (error) {
            this.logger.error(`Błąd podczas importu pliku ${fileType}:`, error);
            throw new common_1.BadRequestException(`Błąd podczas importu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
        }
    }
    async parseEvtFile(content, competitionId) {
        const lines = content
            .split('\n')
            .filter((line) => line.trim() && !line.startsWith(';'));
        const events = [];
        const results = [];
        let currentEvent = null;
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 6 && parts[0] && !parts[0].startsWith(' ')) {
                currentEvent = {
                    eventNumber: parts[0],
                    round: parts[1],
                    heat: parts[2],
                    eventName: parts[3],
                    timestamp: parts[10] || undefined,
                };
                events.push(currentEvent);
            }
            else if (parts.length >= 8 && parts[0] === '' && currentEvent) {
                const result = {
                    startNumber: parts[1],
                    position: parts[2],
                    lastName: parts[3],
                    firstName: parts[4],
                    club: parts[5],
                    licenseNumber: parts[7],
                };
                const extendedResult = result;
                extendedResult.eventNumber = currentEvent.eventNumber;
                extendedResult.round = currentEvent.round;
                extendedResult.heat = currentEvent.heat;
                results.push(extendedResult);
            }
        }
        return await this.processImportedData({ events, results, competitionId });
    }
    async parseLifFile(content, competitionId) {
        const lines = content.split('\n').filter((line) => line.trim());
        const results = [];
        let currentEvent = null;
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 8 &&
                parts[0] &&
                !parts[0].startsWith(';') &&
                !parts[0].match(/^\d+$|^DNS$|^DNF$|^DQ$/)) {
                currentEvent = {
                    eventNumber: parts[0],
                    round: parts[1],
                    heat: parts[2],
                    eventName: parts[3],
                    timestamp: parts[10] || parts[11],
                };
                continue;
            }
            if (parts.length >= 8 &&
                currentEvent &&
                (parts[0] === 'DNS' ||
                    parts[0] === 'DNF' ||
                    parts[0] === 'DQ' ||
                    !isNaN(parseInt(parts[0])))) {
                const result = {
                    startNumber: parts[1],
                    position: parts[0] === 'DNS' || parts[0] === 'DNF' || parts[0] === 'DQ'
                        ? '0'
                        : parts[0],
                    lastName: '',
                    firstName: '',
                    club: parts[4] || parts[5] || '',
                    licenseNumber: parts[7],
                    result: parts[6] || '',
                    reactionTime: parts[8] || '',
                    wind: parts[9] || '',
                    status: parts[0] === 'DNS' || parts[0] === 'DNF' || parts[0] === 'DQ'
                        ? parts[0]
                        : undefined,
                };
                const extendedResult = result;
                extendedResult.eventNumber = currentEvent.eventNumber;
                extendedResult.round = currentEvent.round;
                extendedResult.heat = currentEvent.heat;
                extendedResult.eventName = currentEvent.eventName;
                extendedResult.timestamp = currentEvent.timestamp;
                results.push(extendedResult);
            }
        }
        return await this.processImportedData({
            events: [],
            results,
            competitionId,
        });
    }
    parseSchFile(content) {
        const lines = content
            .split('\n')
            .filter((line) => line.trim() && !line.startsWith(';'));
        const events = [];
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const event = {
                    eventNumber: parts[0],
                    round: parts[1],
                    heat: parts[2],
                    eventName: `Konkurencja ${parts[0]}`,
                };
                events.push(event);
            }
        }
        return { message: 'Harmonogram zaimportowany', eventsCount: events.length };
    }
    async processImportedData(data) {
        const { results, competitionId } = data;
        let processedResults = 0;
        const errors = [];
        const createdResults = [];
        for (const result of results) {
            try {
                const athlete = await this.prisma.athlete.findFirst({
                    where: { licenseNumber: result.licenseNumber },
                });
                if (!athlete) {
                    errors.push(`Nie znaleziono zawodnika z numerem licencji: ${result.licenseNumber}`);
                    continue;
                }
                const extendedResult = result;
                const eventNumber = extendedResult.eventNumber;
                const eventName = extendedResult.eventName;
                const round = extendedResult.round;
                const heat = extendedResult.heat;
                let event = null;
                if (eventName && competitionId) {
                    const suggestions = await this.getEventMappingSuggestions(competitionId, eventName);
                    if (suggestions.length > 0) {
                        event = await this.prisma.event.findFirst({
                            where: { id: suggestions[0].id },
                        });
                    }
                }
                if (!event && eventName && competitionId) {
                    const foundEvent = await this.prisma.event.findFirst({
                        where: {
                            competitionId: competitionId,
                            name: {
                                contains: eventName.split('-')[0].trim(),
                            },
                        },
                        select: {
                            id: true,
                            name: true,
                            competitionId: true,
                        },
                    });
                    if (foundEvent) {
                        event = foundEvent;
                    }
                }
                if (!event && eventNumber && competitionId) {
                    const events = await this.prisma.event.findMany({
                        where: { competitionId: competitionId },
                        orderBy: { createdAt: 'asc' },
                        select: {
                            id: true,
                            name: true,
                            competitionId: true,
                        },
                    });
                    const eventIndex = parseInt(eventNumber) - 1;
                    if (eventIndex >= 0 && eventIndex < events.length) {
                        event = events[eventIndex];
                    }
                }
                if (!event) {
                    errors.push(`Nie znaleziono konkurencji dla: ${eventName || eventNumber} (Seria: ${heat})`);
                    continue;
                }
                const registrationEvent = await this.prisma.registrationEvent.findFirst({
                    where: {
                        eventId: event.id,
                        registration: {
                            athleteId: athlete.id,
                        },
                    },
                    include: {
                        registration: true,
                    },
                });
                if (!registrationEvent) {
                    errors.push(`Nie znaleziono rejestracji dla zawodnika ${athlete.firstName} ${athlete.lastName} w konkurencji ${event.name}`);
                    continue;
                }
                const registration = registrationEvent.registration;
                const resultData = {
                    athleteId: athlete.id,
                    eventId: event.id,
                    registrationId: registration.id,
                    result: result.result || '',
                    position: result.position && result.position !== '0'
                        ? parseInt(result.position)
                        : undefined,
                    wind: result.wind || undefined,
                    reaction: result.reactionTime || undefined,
                    isDNS: result.status === 'DNS',
                    isDNF: result.status === 'DNF',
                    isDQ: result.status === 'DQ',
                    isValid: result.status !== 'DNS' &&
                        result.status !== 'DNF' &&
                        result.status !== 'DQ',
                    notes: `Import z Finishlynx - Seria: ${heat || 'N/A'}, Runda: ${round || 'N/A'}${extendedResult.timestamp ? `, Czas: ${extendedResult.timestamp}` : ''}`,
                };
                await this.prisma.result.upsert({
                    where: {
                        athleteId_eventId: {
                            athleteId: athlete.id,
                            eventId: event.id,
                        },
                    },
                    update: resultData,
                    create: resultData,
                    include: {
                        athlete: true,
                        event: true,
                    },
                });
                createdResults.push({
                    athlete: `${athlete.firstName} ${athlete.lastName}`,
                    event: event.name,
                    result: result.result || '',
                    position: result.position || '',
                    heat: heat || '',
                    status: result.status,
                });
                processedResults++;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
                errors.push(`Błąd przetwarzania wyniku dla licencji ${result.licenseNumber}: ${errorMessage}`);
            }
        }
        return {
            message: 'Import zakończony',
            processedResults,
            totalResults: results.length,
            errors,
            results: createdResults,
        };
    }
    getImportHistory() {
        return {
            message: 'Historia importów',
            imports: [],
        };
    }
    async getEventMappingSuggestions(competitionId, finishlynxEventName) {
        const events = await this.prisma.event.findMany({
            where: { competitionId },
            select: {
                id: true,
                name: true,
                category: true,
                gender: true,
                distance: true,
                discipline: true,
            },
        });
        const mappedEvent = this.mapFinishlynxEventName(finishlynxEventName);
        const suggestions = events
            .filter((event) => {
            let score = 0;
            if (mappedEvent.distance &&
                event.name.toLowerCase().includes(mappedEvent.distance.toLowerCase())) {
                score += 10;
            }
            if (mappedEvent.discipline &&
                event.discipline &&
                event.discipline
                    .toLowerCase()
                    .includes(mappedEvent.discipline.toLowerCase())) {
                score += 8;
            }
            if (mappedEvent.category &&
                event.category &&
                event.category
                    .toLowerCase()
                    .includes(mappedEvent.category.toLowerCase())) {
                score += 5;
            }
            if (mappedEvent.gender && event.gender === mappedEvent.gender) {
                score += 5;
            }
            const eventNameLower = event.name.toLowerCase();
            const finishlynxNameLower = finishlynxEventName.toLowerCase();
            const eventParts = eventNameLower.split(/[\s\-_]+/);
            const finishlynxParts = finishlynxNameLower.split(/[\s\-_]+/);
            const hasCommonParts = finishlynxParts.some((part) => eventParts.some((eventPart) => eventPart.includes(part) || part.includes(eventPart)));
            if (hasCommonParts)
                score += 3;
            return score > 0;
        })
            .map((event) => ({
            id: event.id,
            name: event.name,
            category: event.category || undefined,
            gender: event.gender || undefined,
            distance: event.distance || undefined,
            discipline: event.discipline || undefined,
            mappingScore: this.calculateMappingScore(event, mappedEvent, finishlynxEventName),
        }))
            .sort((a, b) => b.mappingScore - a.mappingScore);
        return suggestions;
    }
    calculateMappingScore(event, mappedEvent, finishlynxEventName) {
        let score = 0;
        if (mappedEvent.distance &&
            event.name.toLowerCase().includes(mappedEvent.distance.toLowerCase())) {
            score += 10;
        }
        if (mappedEvent.discipline &&
            event.discipline &&
            event.discipline
                .toLowerCase()
                .includes(mappedEvent.discipline.toLowerCase())) {
            score += 8;
        }
        if (mappedEvent.category &&
            event.category &&
            event.category.toLowerCase().includes(mappedEvent.category.toLowerCase())) {
            score += 5;
        }
        if (mappedEvent.gender && event.gender === mappedEvent.gender) {
            score += 5;
        }
        if (event.name.toLowerCase() === finishlynxEventName.toLowerCase()) {
            score += 20;
        }
        return score;
    }
    async importWithCustomMapping(importData, eventMappings, competitionId) {
        const modifiedResults = importData.results.map((result) => {
            const extendedResult = result;
            const eventName = extendedResult.eventName;
            if (eventName && eventMappings[eventName]) {
                extendedResult.customEventId = eventMappings[eventName];
            }
            return extendedResult;
        });
        return await this.processImportedDataWithMapping({
            results: modifiedResults,
        }, competitionId);
    }
    async processImportedDataWithMapping(data, competitionId) {
        const { results } = data;
        let processedResults = 0;
        const errors = [];
        const createdResults = [];
        for (const result of results) {
            try {
                const athlete = await this.prisma.athlete.findFirst({
                    where: { licenseNumber: result.licenseNumber },
                });
                if (!athlete) {
                    errors.push(`Nie znaleziono zawodnika z numerem licencji: ${result.licenseNumber}`);
                    continue;
                }
                let event = null;
                if (result.customEventId) {
                    const foundEvent = await this.prisma.event.findFirst({
                        where: { id: result.customEventId },
                        select: { id: true, name: true },
                    });
                    if (foundEvent) {
                        event = foundEvent;
                    }
                }
                if (!event) {
                    const eventName = result.eventName;
                    if (eventName && competitionId) {
                        const suggestions = await this.getEventMappingSuggestions(competitionId, eventName);
                        if (suggestions.length > 0) {
                            const foundEvent = await this.prisma.event.findFirst({
                                where: { id: suggestions[0].id },
                                select: { id: true, name: true },
                            });
                            if (foundEvent) {
                                event = foundEvent;
                            }
                        }
                    }
                }
                if (!event) {
                    errors.push(`Nie znaleziono konkurencji dla: ${result.eventName || 'nieznana'}`);
                    continue;
                }
                const registrationEvent = await this.prisma.registrationEvent.findFirst({
                    where: {
                        eventId: event.id,
                        registration: {
                            athleteId: athlete.id,
                        },
                    },
                    include: {
                        registration: true,
                    },
                });
                if (!registrationEvent) {
                    errors.push(`Nie znaleziono rejestracji dla zawodnika ${athlete.firstName} ${athlete.lastName} w konkurencji ${event.name}`);
                    continue;
                }
                const registration = registrationEvent.registration;
                const resultData = {
                    athleteId: athlete.id,
                    eventId: event.id,
                    registrationId: registration.id,
                    result: result.result || '',
                    position: result.position && result.position !== '0'
                        ? parseInt(result.position)
                        : undefined,
                    wind: result.wind || undefined,
                    reaction: result.reactionTime || undefined,
                    isDNS: result.status === 'DNS',
                    isDNF: result.status === 'DNF',
                    isDQ: result.status === 'DQ',
                    isValid: result.status !== 'DNS' &&
                        result.status !== 'DNF' &&
                        result.status !== 'DQ',
                    notes: `Import z Finishlynx - Seria: ${result.heat || 'N/A'}, Runda: ${result.round || 'N/A'}`,
                };
                await this.prisma.result.upsert({
                    where: {
                        athleteId_eventId: {
                            athleteId: athlete.id,
                            eventId: event.id,
                        },
                    },
                    update: resultData,
                    create: resultData,
                    include: {
                        athlete: true,
                        event: true,
                    },
                });
                createdResults.push({
                    athlete: `${athlete.firstName} ${athlete.lastName}`,
                    event: event.name,
                    result: result.result || '',
                    position: result.position || '',
                    heat: '',
                    status: result.status,
                });
                processedResults++;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
                errors.push(`Błąd przetwarzania wyniku dla licencji ${result.licenseNumber}: ${errorMessage}`);
            }
        }
        return {
            message: 'Import z custom mapowaniem zakończony',
            processedResults,
            totalResults: results.length,
            errors,
            results: createdResults,
        };
    }
    async processAgentResults(competitionId, fileName, results) {
        let processedResults = 0;
        const errors = [];
        const createdResults = [];
        for (const result of results) {
            try {
                const athlete = await this.prisma.athlete.findFirst({
                    where: { licenseNumber: result.licenseNumber },
                });
                if (!athlete) {
                    errors.push(`Nie znaleziono zawodnika z numerem licencji: ${result.licenseNumber}`);
                    continue;
                }
                let event = null;
                if (result.eventInfo?.eventName) {
                    const suggestions = await this.getEventMappingSuggestions(competitionId, result.eventInfo.eventName);
                    if (suggestions.length > 0) {
                        const foundEvent = await this.prisma.event.findFirst({
                            where: { id: suggestions[0].id },
                            select: { id: true, name: true },
                        });
                        if (foundEvent) {
                            event = foundEvent;
                        }
                    }
                }
                if (!event) {
                    errors.push(`Nie znaleziono konkurencji dla wyniku z pliku ${fileName}`);
                    continue;
                }
                const registrationEvent = await this.prisma.registrationEvent.findFirst({
                    where: {
                        eventId: event.id,
                        registration: {
                            athleteId: athlete.id,
                        },
                    },
                    include: {
                        registration: true,
                    },
                });
                if (!registrationEvent) {
                    errors.push(`Nie znaleziono rejestracji dla zawodnika ${athlete.firstName} ${athlete.lastName} w konkurencji ${event.name}`);
                    continue;
                }
                const registration = registrationEvent.registration;
                const resultData = {
                    athleteId: athlete.id,
                    eventId: event.id,
                    registrationId: registration.id,
                    result: result.result || '',
                    position: result.position ? parseInt(result.position) : undefined,
                    wind: result.wind || undefined,
                    reaction: result.reactionTime || undefined,
                    isDNS: result.status === 'DNS',
                    isDNF: result.status === 'DNF',
                    isDQ: result.status === 'DQ',
                    isValid: result.status === 'VALID',
                    notes: `Agent Import - ${fileName} - Seria: ${result.eventInfo?.heat || 'N/A'}`,
                };
                await this.prisma.result.upsert({
                    where: {
                        athleteId_eventId: {
                            athleteId: athlete.id,
                            eventId: event.id,
                        },
                    },
                    update: resultData,
                    create: resultData,
                    include: {
                        athlete: true,
                        event: true,
                    },
                });
                createdResults.push({
                    athlete: `${athlete.firstName} ${athlete.lastName}`,
                    event: event.name,
                    result: result.result || '',
                    position: result.position ? parseInt(result.position) : undefined,
                    status: result.status,
                });
                processedResults++;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
                errors.push(`Błąd przetwarzania wyniku dla licencji ${result.licenseNumber}: ${errorMessage}`);
            }
        }
        return {
            message: 'Import z Agent zakończony',
            fileName,
            processedResults,
            totalResults: results.length,
            errors,
            results: createdResults,
        };
    }
    async exportStartListsForAgent(competitionId) {
        try {
            const events = await this.prisma.event.findMany({
                where: { competitionId },
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
                orderBy: {
                    scheduledTime: 'asc',
                },
            });
            const startLists = events.map((event, index) => ({
                eventNumber: (index + 1).toString(),
                name: event.name,
                round: 'Final',
                heat: '1',
                scheduledTime: event.scheduledTime?.toISOString() || '',
                registrations: event.registrationEvents.map((regEvent) => ({
                    startNumber: regEvent.registration.bibNumber || '',
                    athlete: {
                        firstName: regEvent.registration.athlete.firstName,
                        lastName: regEvent.registration.athlete.lastName,
                        licenseNumber: regEvent.registration.athlete.licenseNumber || '',
                        club: regEvent.registration.athlete.club || '',
                    },
                })),
            }));
            return startLists;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            throw new common_1.BadRequestException(`Błąd eksportu list startowych: ${errorMessage}`);
        }
    }
    async generateAgentConfigFile(competitionId, user) {
        try {
            const competition = await this.prisma.competition.findUnique({
                where: { id: competitionId },
            });
            if (!competition) {
                throw new common_1.BadRequestException('Nie znaleziono zawodów');
            }
            const deviceToken = `athletics-platform-${competitionId}-${Date.now()}`;
            const configData = {
                url: process.env.FRONTEND_URL?.replace(/^https?:\/\//, '') ||
                    'localhost:3000',
                token: deviceToken,
                deviceId: `athletics-platform-agent-${Math.floor(Math.random() * 100000)}`,
                email: user.email || '',
                meetingId: parseInt(competitionId.replace(/\D/g, '')) ||
                    Math.floor(Math.random() * 100000),
                meetingName: competition.name,
                timingSystem: 'FinishLynx',
                devServer: process.env.NODE_ENV === 'development',
            };
            return {
                filename: `meeting-${configData.meetingId}-athletics-platform-auth.roster`,
                content: JSON.stringify(configData),
                mimeType: 'application/json',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            throw new common_1.BadRequestException(`Błąd generowania konfiguracji Agent: ${errorMessage}`);
        }
    }
    mapFinishlynxEventName(finishlynxName) {
        const name = finishlynxName.toLowerCase().trim();
        const mapping = {};
        if (name.match(/\b25m\b/))
            mapping.distance = '25m';
        if (name.match(/\b30m\b/))
            mapping.distance = '30m';
        if (name.match(/\b40m\b/))
            mapping.distance = '40m';
        if (name.match(/\b50m\b/))
            mapping.distance = '50m';
        if (name.match(/\b55m\b/))
            mapping.distance = '55m';
        if (name.match(/\b60m\b/))
            mapping.distance = '60m';
        if (name.match(/\b75m\b/))
            mapping.distance = '75m';
        if (name.match(/\b80m\b/))
            mapping.distance = '80m';
        if (name.match(/\b100m\b/))
            mapping.distance = '100m';
        if (name.match(/\b120m\b/))
            mapping.distance = '120m';
        if (name.match(/\b150m\b/))
            mapping.distance = '150m';
        if (name.match(/\b200m\b/))
            mapping.distance = '200m';
        if (name.match(/\b250m\b/))
            mapping.distance = '250m';
        if (name.match(/\b300m\b/))
            mapping.distance = '300m';
        if (name.match(/\b350m\b/))
            mapping.distance = '350m';
        if (name.match(/\b400m\b/))
            mapping.distance = '400m';
        if (name.match(/\b500m\b/))
            mapping.distance = '500m';
        if (name.match(/\b600m\b/))
            mapping.distance = '600m';
        if (name.match(/\b800m\b/))
            mapping.distance = '800m';
        if (name.match(/\b1000m\b/))
            mapping.distance = '1000m';
        if (name.match(/\b1200m\b/))
            mapping.distance = '1200m';
        if (name.match(/\b1500m\b/))
            mapping.distance = '1500m';
        if (name.match(/\b1600m\b/))
            mapping.distance = '1600m';
        if (name.match(/\b2000m\b/))
            mapping.distance = '2000m';
        if (name.match(/\b3000m\b/))
            mapping.distance = '3000m';
        if (name.match(/\b3200m\b/))
            mapping.distance = '3200m';
        if (name.match(/\b5000m\b/))
            mapping.distance = '5000m';
        if (name.match(/\b10000m\b/))
            mapping.distance = '10000m';
        if (name.match(/\b1\s*mil[ai]\b/))
            mapping.distance = '1 Mila';
        if (name.match(/\b2\s*mil[ai]\b/))
            mapping.distance = '2 Mile';
        if (name.includes('pł') ||
            name.includes('płotki') ||
            name.includes('hurdles')) {
            mapping.discipline = 'płotki';
            if (name.match(/\b40m\s*pł/))
                mapping.distance = '40m pł';
            if (name.match(/\b50m\s*pł/))
                mapping.distance = '50m pł';
            if (name.match(/\b55m\s*pł/))
                mapping.distance = '55m pł';
            if (name.match(/\b60m\s*pł/))
                mapping.distance = '60m pł';
            if (name.match(/\b80m\s*pł/))
                mapping.distance = '80m pł';
            if (name.match(/\b100m\s*pł/))
                mapping.distance = '100m pł';
            if (name.match(/\b110m\s*pł/))
                mapping.distance = '110m pł';
            if (name.match(/\b200m\s*pł/))
                mapping.distance = '200m pł';
            if (name.match(/\b300m\s*pł/))
                mapping.distance = '300m pł';
            if (name.match(/\b400m\s*pł/))
                mapping.distance = '400m pł';
        }
        if (name.includes('prz') || name.includes('steeplechase')) {
            mapping.discipline = 'przeszkody';
            if (name.match(/\b600m\s*prz/))
                mapping.distance = '600m prz';
            if (name.match(/\b800m\s*prz/))
                mapping.distance = '800m prz';
            if (name.match(/\b1000m\s*prz/))
                mapping.distance = '1000m prz';
            if (name.match(/\b1500m\s*prz/))
                mapping.distance = '1500m prz';
            if (name.match(/\b2000m\s*prz/))
                mapping.distance = '2000m prz';
            if (name.match(/\b3000m\s*prz/))
                mapping.distance = '3000m prz';
        }
        if (name.includes('chód') || name.includes('walk')) {
            mapping.discipline = 'chód sportowy';
            if (name.match(/\bchód\s*600m/))
                mapping.distance = 'Chód 600m';
            if (name.match(/\bchód\s*800m/))
                mapping.distance = 'Chód 800m';
            if (name.match(/\bchód\s*1000m/))
                mapping.distance = 'Chód 1000m';
            if (name.match(/\bchód\s*1km/))
                mapping.distance = 'Chód 1km';
            if (name.match(/\bchód\s*2000m/))
                mapping.distance = 'Chód 2000m';
            if (name.match(/\bchód\s*2km/))
                mapping.distance = 'Chód 2km';
            if (name.match(/\bchód\s*3000m/))
                mapping.distance = 'Chód 3000m';
            if (name.match(/\bchód\s*3km/))
                mapping.distance = 'Chód 3km';
            if (name.match(/\bchód\s*5000m/))
                mapping.distance = 'Chód 5000m';
            if (name.match(/\bchód\s*5km/))
                mapping.distance = 'Chód 5km';
            if (name.match(/\bchód\s*10000m/))
                mapping.distance = 'Chód 10000m';
            if (name.match(/\bchód\s*10km/))
                mapping.distance = 'Chód 10km';
            if (name.match(/\bchód\s*20000m/))
                mapping.distance = 'Chód 20000m';
            if (name.match(/\bchód\s*20km/))
                mapping.distance = 'Chód 20km';
        }
        if (name.includes('skok')) {
            mapping.discipline = 'skoki';
            if (name.includes('wzwyż') || name.includes('high jump'))
                mapping.distance = 'Skok wzwyż';
            if (name.includes('tyczce') || name.includes('pole vault'))
                mapping.distance = 'Skok o tyczce';
            if (name.includes('w dal') || name.includes('long jump'))
                mapping.distance = 'Skok w dal';
            if (name.includes('trójskok') || name.includes('triple jump'))
                mapping.distance = 'Trójskok';
        }
        if (name.includes('rzut') ||
            name.includes('pchnięcie') ||
            name.includes('throw') ||
            name.includes('shot put')) {
            mapping.discipline = 'rzuty';
            if (name.includes('kulą') || name.includes('shot put'))
                mapping.distance = 'Pchnięcie kulą';
            if (name.includes('dyskiem') || name.includes('discus'))
                mapping.distance = 'Rzut dyskiem';
            if (name.includes('młotem') || name.includes('hammer'))
                mapping.distance = 'Rzut młotem';
            if (name.includes('oszczepem') || name.includes('javelin'))
                mapping.distance = 'Rzut oszczepem';
            if (name.includes('ciężarkiem') || name.includes('weight'))
                mapping.distance = 'Rzut ciężarkiem';
            if (name.includes('piłeczką') || name.includes('ball'))
                mapping.distance = 'Rzut piłeczką';
        }
        if (name.includes('sztafeta') ||
            name.includes('4x') ||
            name.includes('relay')) {
            mapping.discipline = 'sztafety';
            if (name.match(/\b4x40m\b/))
                mapping.distance = '4x40m';
            if (name.match(/\b4x50m\b/))
                mapping.distance = '4x50m';
            if (name.match(/\b4x60m\b/))
                mapping.distance = '4x60m';
            if (name.match(/\b4x80m\b/))
                mapping.distance = '4x80m';
            if (name.match(/\b4x100m\b/))
                mapping.distance = '4x100m';
            if (name.match(/\b4x200m\b/))
                mapping.distance = '4x200m';
            if (name.match(/\b4x300m\b/))
                mapping.distance = '4x300m';
            if (name.match(/\b4x400m\b/))
                mapping.distance = '4x400m';
            if (name.match(/\b4x600m\b/))
                mapping.distance = '4x600m';
            if (name.match(/\b4x800m\b/))
                mapping.distance = '4x800m';
            if (name.match(/\b4x1500m\b/))
                mapping.distance = '4x1500m';
        }
        if (name.includes('bój') || name.includes('athlon')) {
            mapping.discipline = 'wieloboje';
            if (name.includes('pięciobój') || name.includes('pentathlon'))
                mapping.distance = 'Pięciobój';
            if (name.includes('siedmiobój') || name.includes('heptathlon'))
                mapping.distance = 'Siedmiobój';
            if (name.includes('dziesięciobój') || name.includes('decathlon'))
                mapping.distance = 'Dziesięciobój';
        }
        if (name.match(/\bu14\b/i))
            mapping.category = 'U14';
        if (name.match(/\bu16\b/i))
            mapping.category = 'U16';
        if (name.match(/\bu18\b/i))
            mapping.category = 'U18';
        if (name.match(/\bu20\b/i))
            mapping.category = 'U20';
        if (name.match(/\bu23\b/i))
            mapping.category = 'U23';
        if (name.match(/\bsenior\b/i))
            mapping.category = 'Senior';
        if (name.match(/\bmaster\b/i))
            mapping.category = 'Master';
        if (name.match(/\bżak\b/i))
            mapping.category = 'Żak';
        if (name.match(/\bmlodzik\b/i))
            mapping.category = 'Młodzik';
        if (name.match(/\bjunior\b/i))
            mapping.category = 'Junior';
        if (name.match(/\b[km]\b|\bkob|\bmęż|\bmen|\bwom|\bmale|\bfemale/i)) {
            if (name.match(/\bk\b|\bkob|\bwom|\bfemale/i))
                mapping.gender = 'K';
            if (name.match(/\bm\b|\bmęż|\bmen|\bmale/i))
                mapping.gender = 'M';
        }
        if (name.includes('sh') || name.includes('short track'))
            mapping.distance = (mapping.distance || '') + ' sh';
        if (name.includes('ot') || name.includes('oversized'))
            mapping.distance = (mapping.distance || '') + ' OT';
        if (name.includes('km') || name.includes('mixed'))
            mapping.distance = (mapping.distance || '') + ' KM';
        return mapping;
    }
    async previewFile(content, fileType, competitionId) {
        const lines = content
            .split('\n')
            .filter((line) => line.trim() && !line.startsWith(';'));
        switch (fileType) {
            case 'lif':
                return this.previewLifFile(lines, competitionId);
            case 'evt':
                return this.previewEvtFile(lines, competitionId);
            case 'sch':
                return this.previewSchFile(lines);
            default:
                throw new common_1.BadRequestException('Nieobsługiwany typ pliku');
        }
    }
    async previewLifFile(lines, competitionId) {
        let eventInfo = null;
        const athletes = [];
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 8 &&
                parts[0] &&
                !parts[0].match(/^\d+$|^DNS$|^DNF$|^DQ$/)) {
                eventInfo = {
                    eventNumber: parts[0],
                    round: parts[1],
                    heat: parts[2],
                    eventName: parts[3],
                    timestamp: parts[10] || parts[11],
                };
                continue;
            }
            if (parts.length >= 8 &&
                (parts[0] === 'DNS' ||
                    parts[0] === 'DNF' ||
                    parts[0] === 'DQ' ||
                    !isNaN(parseInt(parts[0])))) {
                const athlete = await this.prisma.athlete.findFirst({
                    where: { licenseNumber: parts[7] },
                    select: { id: true, firstName: true, lastName: true, club: true },
                });
                athletes.push({
                    position: parts[0],
                    startNumber: parts[1],
                    club: parts[4] || parts[5],
                    licenseNumber: parts[7],
                    result: parts[6],
                    reactionTime: parts[8],
                    wind: parts[9],
                    status: parts[0] === 'DNS' || parts[0] === 'DNF' || parts[0] === 'DQ'
                        ? parts[0]
                        : null,
                    athlete: athlete
                        ? `${athlete.firstName} ${athlete.lastName}`
                        : 'Nie znaleziono',
                    athleteFound: !!athlete,
                });
            }
        }
        let eventSuggestions = [];
        if (eventInfo && competitionId) {
            eventSuggestions = await this.getEventMappingSuggestions(competitionId, eventInfo.eventName);
        }
        return {
            fileType: 'lif',
            eventInfo,
            athletes,
            eventSuggestions,
            summary: {
                totalAthletes: athletes.length,
                athletesFound: athletes.filter((a) => a.athleteFound).length,
                athletesNotFound: athletes.filter((a) => !a.athleteFound).length,
                dnsCount: athletes.filter((a) => a.status === 'DNS').length,
                dnfCount: athletes.filter((a) => a.status === 'DNF').length,
                dqCount: athletes.filter((a) => a.status === 'DQ').length,
            },
        };
    }
    async previewEvtFile(lines, competitionId) {
        const events = [];
        const athletes = [];
        let currentEvent = null;
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 6 && parts[0] && !parts[0].startsWith(' ')) {
                currentEvent = {
                    eventNumber: parts[0],
                    round: parts[1],
                    heat: parts[2],
                    eventName: parts[3],
                };
                events.push(currentEvent);
            }
            else if (parts.length >= 8 && parts[0] === '' && currentEvent) {
                const athlete = await this.prisma.athlete.findFirst({
                    where: { licenseNumber: parts[7] },
                    select: { id: true, firstName: true, lastName: true, club: true },
                });
                athletes.push({
                    eventNumber: currentEvent.eventNumber,
                    eventName: currentEvent.eventName,
                    startNumber: parts[1],
                    position: parts[2],
                    lastName: parts[3],
                    firstName: parts[4],
                    club: parts[5],
                    licenseNumber: parts[7],
                    athlete: athlete
                        ? `${athlete.firstName} ${athlete.lastName}`
                        : 'Nie znaleziono',
                    athleteFound: !!athlete,
                });
            }
        }
        return {
            fileType: 'evt',
            events,
            athletes,
            summary: {
                totalEvents: events.length,
                totalAthletes: athletes.length,
                athletesFound: athletes.filter((a) => a.athleteFound).length,
                athletesNotFound: athletes.filter((a) => !a.athleteFound).length,
            },
        };
    }
    previewSchFile(lines) {
        const schedule = [];
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 3) {
                schedule.push({
                    eventNumber: parts[0],
                    round: parts[1],
                    heat: parts[2],
                });
            }
        }
        return {
            fileType: 'sch',
            schedule,
            summary: {
                totalEntries: schedule.length,
            },
        };
    }
    validateFinishlynxFile(fileContent, fileType) {
        try {
            const lines = fileContent.split('\n').filter((line) => line.trim());
            if (lines.length === 0) {
                throw new common_1.BadRequestException('Plik jest pusty');
            }
            switch (fileType) {
                case 'evt':
                    return this.validateEvtFile(lines);
                case 'lif':
                    return this.validateLifFile(lines);
                case 'sch':
                    return this.validateSchFile(lines);
                default:
                    throw new common_1.BadRequestException('Nieobsługiwany typ pliku');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            throw new common_1.BadRequestException(`Błąd walidacji pliku: ${errorMessage}`);
        }
    }
    validateEvtFile(lines) {
        let eventCount = 0;
        let resultCount = 0;
        for (const line of lines) {
            if (line.startsWith(';'))
                continue;
            const parts = line.split(',');
            if (parts.length >= 6 && parts[0] && !parts[0].startsWith(' ')) {
                eventCount++;
            }
            else if (parts.length >= 8 && parts[0] === '') {
                resultCount++;
            }
        }
        return {
            valid: true,
            fileType: 'evt',
            eventCount,
            resultCount,
            message: `Plik EVT zawiera ${eventCount} konkurencji i ${resultCount} wyników`,
        };
    }
    validateLifFile(lines) {
        let resultCount = 0;
        for (const line of lines) {
            if (line.startsWith(';'))
                continue;
            const parts = line.split(',');
            if (parts.length >= 8 &&
                (parts[0] === 'DNS' ||
                    parts[0] === 'DNF' ||
                    parts[0] === 'DQ' ||
                    !isNaN(parseInt(parts[0])))) {
                resultCount++;
            }
        }
        return {
            valid: true,
            fileType: 'lif',
            resultCount,
            message: `Plik LIF zawiera ${resultCount} wyników z czasami`,
        };
    }
    validateSchFile(lines) {
        let eventCount = 0;
        for (const line of lines) {
            if (line.startsWith(';'))
                continue;
            const parts = line.split(',');
            if (parts.length >= 3) {
                eventCount++;
            }
        }
        return {
            valid: true,
            fileType: 'sch',
            eventCount,
            message: `Plik SCH zawiera ${eventCount} pozycji harmonogramu`,
        };
    }
};
exports.FinishlynxService = FinishlynxService;
exports.FinishlynxService = FinishlynxService = FinishlynxService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinishlynxService);
//# sourceMappingURL=finishlynx.service.js.map