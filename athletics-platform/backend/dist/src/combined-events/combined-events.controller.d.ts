import { CombinedEventsService } from './combined-events.service';
import { CreateCombinedEventDto } from './dto/create-combined-event.dto';
import { UpdateCombinedEventResultDto } from './dto/update-combined-event-result.dto';
import { CalculatePointsDto } from './dto/calculate-points.dto';
import { ValidatePerformanceDto } from './dto/validate-performance.dto';
import { CombinedEventType } from './types/combined-events.types';
export declare class CombinedEventsController {
    private readonly combinedEventsService;
    constructor(combinedEventsService: CombinedEventsService);
    getEventTypes(): {
        type: CombinedEventType;
        name: string;
        description: string;
        gender: string;
        disciplines: number;
        official: boolean;
        category: string;
    }[];
    getDisciplines(eventType: CombinedEventType, gender?: 'MALE' | 'FEMALE'): {
        eventType: CombinedEventType;
        gender: string;
        disciplines: import("./types/combined-events.types").CombinedEventDiscipline[];
    };
    create(createDto: CreateCombinedEventDto): Promise<{
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
    findOne(id: string): Promise<{
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
    }>;
    findByCompetition(competitionId: string): Promise<({
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
    getRanking(competitionId: string, eventType: CombinedEventType): Promise<{}>;
    getStatistics(competitionId: string): Promise<{
        totalEvents: number;
        completedEvents: number;
        averagePoints: number;
        bestPerformance: {
            totalPoints: number;
            eventType: string;
        } | null;
        eventTypeBreakdown: Record<string, number>;
    }>;
    updateResult(id: string, discipline: string, updateDto: UpdateCombinedEventResultDto): Promise<{
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
    recalculate(id: string): Promise<{
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
    remove(id: string): Promise<{
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
    calculatePoints(calculatePointsDto: CalculatePointsDto): {
        points: number;
    };
    validatePerformance(validatePerformanceDto: ValidatePerformanceDto): {
        isValid: boolean;
    };
}
