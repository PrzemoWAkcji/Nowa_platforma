import { HeatService } from './heat.service';
import { CreateHeatDto } from './dto/create-heat.dto';
import { UpdateHeatDto } from './dto/update-heat.dto';
import { AutoAssignDto, AdvancedAutoAssignDto } from './dto/auto-assign.dto';
export declare class HeatController {
    private readonly heatService;
    constructor(heatService: HeatService);
    create(createHeatDto: CreateHeatDto): Promise<{
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
        assignments: ({
            registration: {
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.RegistrationStatus;
                competitionId: string;
                athleteId: string;
                userId: string;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentDate: Date | null;
                seedTime: string | null;
                notes: string | null;
                bibNumber: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seedTime: string | null;
            registrationId: string;
            isDNS: boolean;
            lane: number | null;
            seedRank: number | null;
            assignmentMethod: import(".prisma/client").$Enums.AssignmentMethod;
            isPresent: boolean;
            heatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scheduledTime: Date | null;
        isCompleted: boolean;
        notes: string | null;
        eventId: string;
        round: import(".prisma/client").$Enums.EventRound;
        actualTime: Date | null;
        heatNumber: number;
        maxLanes: number;
    }>;
    findAll(eventId?: string, round?: string): Promise<({
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
        assignments: ({
            registration: {
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.RegistrationStatus;
                competitionId: string;
                athleteId: string;
                userId: string;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentDate: Date | null;
                seedTime: string | null;
                notes: string | null;
                bibNumber: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seedTime: string | null;
            registrationId: string;
            isDNS: boolean;
            lane: number | null;
            seedRank: number | null;
            assignmentMethod: import(".prisma/client").$Enums.AssignmentMethod;
            isPresent: boolean;
            heatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scheduledTime: Date | null;
        isCompleted: boolean;
        notes: string | null;
        eventId: string;
        round: import(".prisma/client").$Enums.EventRound;
        actualTime: Date | null;
        heatNumber: number;
        maxLanes: number;
    })[]>;
    getEventHeats(eventId: string): Promise<({
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
        assignments: ({
            registration: {
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.RegistrationStatus;
                competitionId: string;
                athleteId: string;
                userId: string;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentDate: Date | null;
                seedTime: string | null;
                notes: string | null;
                bibNumber: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seedTime: string | null;
            registrationId: string;
            isDNS: boolean;
            lane: number | null;
            seedRank: number | null;
            assignmentMethod: import(".prisma/client").$Enums.AssignmentMethod;
            isPresent: boolean;
            heatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scheduledTime: Date | null;
        isCompleted: boolean;
        notes: string | null;
        eventId: string;
        round: import(".prisma/client").$Enums.EventRound;
        actualTime: Date | null;
        heatNumber: number;
        maxLanes: number;
    })[]>;
    findOne(id: string): Promise<{
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
        assignments: ({
            registration: {
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.RegistrationStatus;
                competitionId: string;
                athleteId: string;
                userId: string;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentDate: Date | null;
                seedTime: string | null;
                notes: string | null;
                bibNumber: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seedTime: string | null;
            registrationId: string;
            isDNS: boolean;
            lane: number | null;
            seedRank: number | null;
            assignmentMethod: import(".prisma/client").$Enums.AssignmentMethod;
            isPresent: boolean;
            heatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scheduledTime: Date | null;
        isCompleted: boolean;
        notes: string | null;
        eventId: string;
        round: import(".prisma/client").$Enums.EventRound;
        actualTime: Date | null;
        heatNumber: number;
        maxLanes: number;
    }>;
    update(id: string, updateHeatDto: UpdateHeatDto): Promise<{
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
        assignments: ({
            registration: {
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.RegistrationStatus;
                competitionId: string;
                athleteId: string;
                userId: string;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentDate: Date | null;
                seedTime: string | null;
                notes: string | null;
                bibNumber: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seedTime: string | null;
            registrationId: string;
            isDNS: boolean;
            lane: number | null;
            seedRank: number | null;
            assignmentMethod: import(".prisma/client").$Enums.AssignmentMethod;
            isPresent: boolean;
            heatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scheduledTime: Date | null;
        isCompleted: boolean;
        notes: string | null;
        eventId: string;
        round: import(".prisma/client").$Enums.EventRound;
        actualTime: Date | null;
        heatNumber: number;
        maxLanes: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    autoAssign(autoAssignDto: AutoAssignDto): Promise<{
        message: string;
        heats: number;
        participants: number;
        method: import("./dto/auto-assign.dto").AssignmentMethodEnum.SEED_TIME | import("./dto/auto-assign.dto").AssignmentMethodEnum.RANDOM | import("./dto/auto-assign.dto").AssignmentMethodEnum.SERPENTINE | import("./dto/auto-assign.dto").AssignmentMethodEnum.STRAIGHT_FINAL;
        heatsData: any[];
    }>;
    advancedAutoAssign(advancedAutoAssignDto: AdvancedAutoAssignDto): Promise<{
        message: string;
        heats: number;
        participants: number;
        seriesMethod: import("./dto/auto-assign.dto").AssignmentMethodEnum;
        laneMethod: import("./dto/auto-assign.dto").AssignmentMethodEnum;
        heatsData: any[];
    }>;
}
