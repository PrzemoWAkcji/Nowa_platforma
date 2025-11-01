import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CombinedEventType, CombinedEventDiscipline } from './types/combined-events.types';
import { CreateCombinedEventDto } from './dto/create-combined-event.dto';
import { UpdateCombinedEventResultDto } from './dto/update-combined-event-result.dto';
export declare class CombinedEventsService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    calculatePoints(discipline: string, performance: string, gender?: 'MALE' | 'FEMALE'): number;
    getAvailableEventTypes(): {
        type: CombinedEventType;
        name: string;
        description: string;
        gender: string;
        disciplines: number;
        official: boolean;
        category: string;
    }[];
    getDisciplinesForEvent(eventType: CombinedEventType, gender: 'MALE' | 'FEMALE'): CombinedEventDiscipline[];
    createCombinedEvent(createDto: CreateCombinedEventDto): Promise<{
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
    updateEventResult(combinedEventId: string, discipline: string, updateDto: UpdateCombinedEventResultDto): Promise<{
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
    }>;
    recalculateTotalPoints(combinedEventId: string): Promise<{
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
    getCombinedEvent(id: string): Promise<({
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
    }) | null>;
    getCombinedEventsByCompetition(competitionId: string): Promise<({
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
    })[]>;
    getCombinedEventsPaginated(competitionId: string, page?: number, limit?: number): Promise<{
        data: ({
            athlete: {
                id: string;
                firstName: string;
                lastName: string;
                club: string | null;
            };
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    getCombinedEventRanking(competitionId: string, eventType: CombinedEventType): Promise<{}>;
    deleteCombinedEvent(id: string): Promise<{
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
    getCombinedEventStatistics(competitionId: string): Promise<{
        totalEvents: number;
        completedEvents: number;
        averagePoints: number;
        bestPerformance: {
            totalPoints: number;
            eventType: string;
        } | null;
        eventTypeBreakdown: Record<string, number>;
    }>;
    validatePerformance(discipline: string, performance: string): boolean;
}
