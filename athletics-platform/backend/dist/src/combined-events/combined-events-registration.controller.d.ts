import { CombinedEventsRegistrationService, RegisterAthleteForCombinedEventDto } from './combined-events-registration.service';
import { GenerateIndividualEventsDto } from './dto/generate-individual-events.dto';
import { CombinedEventType } from './types/combined-events.types';
export declare class CombinedEventsRegistrationController {
    private readonly registrationService;
    constructor(registrationService: CombinedEventsRegistrationService);
    registerAthlete(dto: RegisterAthleteForCombinedEventDto): Promise<{
        results: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            discipline: string;
            points: number;
            wind: string | null;
            isValid: boolean;
            performance: string | null;
            combinedEventId: string;
            dayOrder: number;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        gender: import(".prisma/client").$Enums.Gender;
        competitionId: string;
        athleteId: string;
        eventType: import(".prisma/client").$Enums.CombinedEventType;
        totalPoints: number;
        isComplete: boolean;
    }>;
    bulkRegisterAthletes(dto: {
        athleteIds: string[];
        competitionId: string;
        eventType: CombinedEventType;
        gender: 'MALE' | 'FEMALE';
        createSeparateEvents?: boolean;
    }): Promise<{
        successful: any[];
        errors: any[];
        summary: {
            total: number;
            successful: number;
            failed: number;
        };
    }>;
    splitCombinedEvent(combinedEventId: string, dto: {
        createRegistrations?: boolean;
    }): Promise<{
        combinedEvent: {
            athlete: {
                id: string;
                firstName: string;
                lastName: string;
                createdAt: Date;
                updatedAt: Date;
                gender: import(".prisma/client").$Enums.Gender;
                category: import(".prisma/client").$Enums.Category;
                club: string | null;
                dateOfBirth: Date;
                nationality: string | null;
                licenseNumber: string | null;
                classification: string | null;
                isParaAthlete: boolean;
                coachId: string | null;
                personalBests: import("@prisma/client/runtime/library").JsonValue | null;
                seasonBests: import("@prisma/client/runtime/library").JsonValue | null;
            };
            competition: {
                name: string;
                description: string | null;
                startDate: Date;
                endDate: Date;
                location: string;
                venue: string | null;
                type: import(".prisma/client").$Enums.CompetitionType;
                registrationStartDate: Date | null;
                registrationEndDate: Date | null;
                maxParticipants: number | null;
                registrationFee: import("@prisma/client/runtime/library").Decimal | null;
                isPublic: boolean;
                allowLateRegistration: boolean;
                liveResultsEnabled: boolean;
                logos: import("@prisma/client/runtime/library").JsonValue | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.CompetitionStatus;
                agentId: string | null;
                liveResultsToken: string | null;
                createdById: string;
            };
            results: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                discipline: string;
                points: number;
                wind: string | null;
                isValid: boolean;
                performance: string | null;
                combinedEventId: string;
                dayOrder: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            gender: import(".prisma/client").$Enums.Gender;
            competitionId: string;
            athleteId: string;
            eventType: import(".prisma/client").$Enums.CombinedEventType;
            totalPoints: number;
            isComplete: boolean;
        };
        createdEvents: any[];
        createdRegistrations: any[];
        message: string;
    }>;
    getCombinedEventRegistrations(competitionId: string): Promise<{
        id: string;
        eventType: import(".prisma/client").$Enums.CombinedEventType;
        athlete: {
            id: string;
            firstName: string;
            lastName: string;
            gender: import(".prisma/client").$Enums.Gender;
            category: import(".prisma/client").$Enums.Category;
            club: string | null;
        };
        totalPoints: number;
        isComplete: boolean;
        resultsCount: number;
        completedDisciplines: number;
        totalDisciplines: number;
    }[]>;
    getAvailableEvents(): {
        type: string;
        name: string;
        description: string;
        gender: string;
        disciplines: string[];
        category: string;
    }[];
    generateIndividualEvents(dto: GenerateIndividualEventsDto): Promise<{
        message: string;
        processedEvents: any[];
        createdEvents: any[];
        createdRegistrations: any[];
        errors: any[];
        summary: {
            totalCombinedEvents: number;
            totalAthletes: number;
            totalCreatedEvents: number;
            totalCreatedRegistrations: number;
        };
    }>;
    getCombinedEventsForGeneration(competitionId: string): Promise<{
        id: string;
        name: string;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        athletesCount: number;
        athletes: {
            id: string;
            firstName: string;
            lastName: string;
            gender: import(".prisma/client").$Enums.Gender;
            category: import(".prisma/client").$Enums.Category;
            club: string | null;
        }[];
        canGenerate: boolean;
        estimatedEventType: CombinedEventType | null;
    }[]>;
}
