import { PrismaService } from '../../prisma/prisma.service';
import { EventType, Gender, Category } from '@prisma/client';
interface EventTemplate {
    name: string;
    type: EventType;
    gender: Gender;
    category: Category;
    distance?: string;
    discipline?: string;
    estimatedDuration: number;
    requiresHeats: boolean;
    maxParticipantsPerHeat: number;
    isFieldEvent: boolean;
}
interface LocalScheduleGeneratorOptions {
    competitionId: string;
    startTime: Date;
    trackEvents?: EventTemplate[];
    fieldEvents?: EventTemplate[];
    breakDuration: number;
    parallelFieldEvents: boolean;
    separateCombinedEvents: boolean;
    selectedEventIds?: string[];
}
export declare class ScheduleGeneratorService {
    private prisma;
    constructor(prisma: PrismaService);
    generateSchedule(options: LocalScheduleGeneratorOptions): Promise<any[]>;
    private groupEventsForScheduling;
    private groupFieldEvents;
    private groupByAgeAndGender;
    private calculateEventStructure;
    private calculateEventDuration;
    private calculateTrackEventDuration;
    private calculateFieldEventDuration;
    private getBaseDuration;
    private generateEventNotes;
    generateMinuteProgram(competitionId: string): Promise<{
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
        schedule: {
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
            items: ({
                event: {
                    name: string;
                    type: import(".prisma/client").$Enums.EventType;
                    maxParticipants: number | null;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    gender: import(".prisma/client").$Enums.Gender;
                    category: import(".prisma/client").$Enums.Category;
                    unit: import(".prisma/client").$Enums.Unit;
                    seedTimeRequired: boolean;
                    scheduledTime: Date | null;
                    isCompleted: boolean;
                    distance: string | null;
                    discipline: string | null;
                    hurdleHeight: string | null;
                    implementWeight: string | null;
                    implementSpecs: import("@prisma/client/runtime/library").JsonValue | null;
                    competitionId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.ScheduleStatus;
                scheduledTime: Date;
                notes: string | null;
                eventId: string;
                round: import(".prisma/client").$Enums.EventRound;
                actualTime: Date | null;
                duration: number | null;
                seriesCount: number;
                finalistsCount: number | null;
                scheduleId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            competitionId: string;
            isPublished: boolean;
        };
        timeGroups: {
            time: any;
            events: any;
        }[];
    }>;
    private formatEventName;
    private formatRound;
    private formatCategory;
}
export {};
