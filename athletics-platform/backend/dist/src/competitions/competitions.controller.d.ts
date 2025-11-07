import { Response } from 'express';
import { FinishlynxService } from '../finishlynx/finishlynx.service';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { StartListImportService } from './startlist-import.service';
export declare class CompetitionsController {
    private readonly competitionsService;
    private readonly finishlynxService;
    private readonly startListImportService;
    constructor(competitionsService: CompetitionsService, finishlynxService: FinishlynxService, startListImportService: StartListImportService);
    create(createCompetitionDto: CreateCompetitionDto): Promise<{
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
    }>;
    findAll(): Promise<({
        _count: {
            registrations: number;
        };
        events: {
            name: string;
            id: string;
            gender: import(".prisma/client").$Enums.Gender;
            category: import(".prisma/client").$Enums.Category;
        }[];
    } & {
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
    })[]>;
    findPublic(): Promise<({
        _count: {
            registrations: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<({
        registrations: ({
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
        })[];
        events: ({
            _count: {
                results: number;
                registrationEvents: number;
            };
        } & {
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
        })[];
    } & {
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
    }) | null>;
    update(id: string, updateCompetitionDto: UpdateCompetitionDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    downloadAgentConfig(id: string, request: {
        user: {
            id: string;
            email: string;
            role: string;
        };
    }, response: Response): Promise<void>;
    toggleLiveResults(id: string, body: {
        enabled: boolean;
    }): Promise<{
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
    }>;
    getLiveResults(token: string): Promise<{
        events: ({
            results: ({
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
                result: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                athleteId: string;
                notes: string | null;
                eventId: string;
                registrationId: string;
                position: number | null;
                points: number | null;
                wind: string | null;
                reaction: string | null;
                splits: import("@prisma/client/runtime/library").JsonValue | null;
                isValid: boolean;
                isDNF: boolean;
                isDNS: boolean;
                isDQ: boolean;
                isPersonalBest: boolean;
                isSeasonBest: boolean;
                isNationalRecord: boolean;
                isWorldRecord: boolean;
                selectedForDopingControl: boolean;
                dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
            })[];
        } & {
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
        })[];
    } & {
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
    }>;
    getCompetitionByAgentId(agentId: string): Promise<({
        events: ({
            registrationEvents: ({
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
                seedTime: string | null;
                eventId: string;
                registrationId: string;
            })[];
        } & {
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
        })[];
    } & {
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
    }) | null>;
    importStartList(competitionId: string, file: Express.Multer.File, format?: string, updateExisting?: string, createMissingAthletes?: string): Promise<import("./dto/import-startlist.dto").ImportStartListResult>;
    importStartListJson(competitionId: string, body: {
        csvData: string;
        format?: string;
    }): Promise<import("./dto/import-startlist.dto").ImportStartListResult>;
    updateCompetitionStatuses(): Promise<{
        message: string;
    }>;
    uploadLogos(competitionId: string, files: Express.Multer.File[]): Promise<{
        message: string;
        logos: any[];
    }>;
    deleteLogo(competitionId: string, logoId: string): Promise<{
        message: string;
        logos: any[];
    }>;
    getLogos(competitionId: string): Promise<{
        logos: any[];
    }>;
}
