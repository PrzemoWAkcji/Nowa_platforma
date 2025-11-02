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
            points: number;
            wind: string | null;
            isValid: boolean;
            discipline: string;
            performance: string | null;
            combinedEventId: string;
            dayOrder: number;
        }[];
        gender: import(".prisma/client").$Enums.Gender;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        athleteId: string;
        competitionId: string;
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
                firstName: string;
                lastName: string;
                dateOfBirth: Date;
                gender: import(".prisma/client").$Enums.Gender;
                club: string | null;
                category: import(".prisma/client").$Enums.Category;
                nationality: string | null;
                licenseNumber: string | null;
                classification: string | null;
                isParaAthlete: boolean;
                coachId: string | null;
                personalBests: import("@prisma/client/runtime/library").JsonValue | null;
                seasonBests: import("@prisma/client/runtime/library").JsonValue | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
            competition: {
                isPublic: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                startDate: Date;
                endDate: Date;
                location: string;
                venue: string | null;
                type: import(".prisma/client").$Enums.CompetitionType;
                status: import(".prisma/client").$Enums.CompetitionStatus;
                agentId: string | null;
                liveResultsEnabled: boolean;
                liveResultsToken: string | null;
                registrationStartDate: Date | null;
                registrationEndDate: Date | null;
                maxParticipants: number | null;
                registrationFee: import("@prisma/client/runtime/library").Decimal | null;
                allowLateRegistration: boolean;
                logos: import("@prisma/client/runtime/library").JsonValue | null;
                createdById: string;
            };
            results: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                points: number;
                wind: string | null;
                isValid: boolean;
                discipline: string;
                performance: string | null;
                combinedEventId: string;
                dayOrder: number;
            }[];
        } & {
            gender: import(".prisma/client").$Enums.Gender;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            athleteId: string;
            competitionId: string;
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
            firstName: string;
            lastName: string;
            gender: import(".prisma/client").$Enums.Gender;
            club: string | null;
            category: import(".prisma/client").$Enums.Category;
            id: string;
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
