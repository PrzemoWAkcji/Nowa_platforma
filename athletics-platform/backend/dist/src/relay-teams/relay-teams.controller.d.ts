import { RelayTeamsService } from './relay-teams.service';
import { CreateRelayTeamDto, UpdateRelayTeamDto, AddRelayTeamMemberDto, CreateRelayTeamRegistrationDto, CreateRelayTeamResultDto } from './dto';
export declare class RelayTeamsController {
    private readonly relayTeamsService;
    constructor(relayTeamsService: RelayTeamsService);
    create(createRelayTeamDto: CreateRelayTeamDto, req: any): Promise<{
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
        registrations: ({
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
            seedTime: string | null;
            eventId: string;
            teamId: string;
        })[];
        _count: {
            registrations: number;
            results: number;
            members: number;
        };
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        results: ({
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
            result: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventId: string;
            position: number | null;
            points: number | null;
            wind: string | null;
            reaction: string | null;
            splits: import("@prisma/client/runtime/library").JsonValue | null;
            isValid: boolean;
            isDNF: boolean;
            isDNS: boolean;
            isDQ: boolean;
            isNationalRecord: boolean;
            isWorldRecord: boolean;
            selectedForDopingControl: boolean;
            dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
            teamId: string;
        })[];
        members: ({
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
            athleteId: string;
            position: number;
            teamId: string;
            isReserve: boolean;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        competitionId: string;
        club: string | null;
    }>;
    findByCompetition(competitionId: string): Promise<({
        registrations: ({
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
            seedTime: string | null;
            eventId: string;
            teamId: string;
        })[];
        _count: {
            registrations: number;
            results: number;
            members: number;
        };
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        results: ({
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
            result: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventId: string;
            position: number | null;
            points: number | null;
            wind: string | null;
            reaction: string | null;
            splits: import("@prisma/client/runtime/library").JsonValue | null;
            isValid: boolean;
            isDNF: boolean;
            isDNS: boolean;
            isDQ: boolean;
            isNationalRecord: boolean;
            isWorldRecord: boolean;
            selectedForDopingControl: boolean;
            dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
            teamId: string;
        })[];
        members: ({
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
            athleteId: string;
            position: number;
            teamId: string;
            isReserve: boolean;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        competitionId: string;
        club: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        registrations: ({
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
            seedTime: string | null;
            eventId: string;
            teamId: string;
        })[];
        _count: {
            registrations: number;
            results: number;
            members: number;
        };
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        results: ({
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
            result: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventId: string;
            position: number | null;
            points: number | null;
            wind: string | null;
            reaction: string | null;
            splits: import("@prisma/client/runtime/library").JsonValue | null;
            isValid: boolean;
            isDNF: boolean;
            isDNS: boolean;
            isDQ: boolean;
            isNationalRecord: boolean;
            isWorldRecord: boolean;
            selectedForDopingControl: boolean;
            dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
            teamId: string;
        })[];
        members: ({
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
            athleteId: string;
            position: number;
            teamId: string;
            isReserve: boolean;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        competitionId: string;
        club: string | null;
    }>;
    update(id: string, updateRelayTeamDto: UpdateRelayTeamDto, req: any): Promise<{
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
        registrations: ({
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
            seedTime: string | null;
            eventId: string;
            teamId: string;
        })[];
        _count: {
            registrations: number;
            results: number;
            members: number;
        };
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        results: ({
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
            result: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventId: string;
            position: number | null;
            points: number | null;
            wind: string | null;
            reaction: string | null;
            splits: import("@prisma/client/runtime/library").JsonValue | null;
            isValid: boolean;
            isDNF: boolean;
            isDNS: boolean;
            isDQ: boolean;
            isNationalRecord: boolean;
            isWorldRecord: boolean;
            selectedForDopingControl: boolean;
            dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
            teamId: string;
        })[];
        members: ({
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
            athleteId: string;
            position: number;
            teamId: string;
            isReserve: boolean;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        competitionId: string;
        club: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        competitionId: string;
        club: string | null;
    }>;
    addMember(teamId: string, addMemberDto: AddRelayTeamMemberDto, req: any): Promise<{
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
        team: {
            members: ({
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
                athleteId: string;
                position: number;
                teamId: string;
                isReserve: boolean;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            competitionId: string;
            club: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        athleteId: string;
        position: number;
        teamId: string;
        isReserve: boolean;
    }>;
    removeMember(teamId: string, memberId: string, req: any): Promise<{
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
        registrations: ({
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
            seedTime: string | null;
            eventId: string;
            teamId: string;
        })[];
        _count: {
            registrations: number;
            results: number;
            members: number;
        };
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        results: ({
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
            result: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventId: string;
            position: number | null;
            points: number | null;
            wind: string | null;
            reaction: string | null;
            splits: import("@prisma/client/runtime/library").JsonValue | null;
            isValid: boolean;
            isDNF: boolean;
            isDNS: boolean;
            isDQ: boolean;
            isNationalRecord: boolean;
            isWorldRecord: boolean;
            selectedForDopingControl: boolean;
            dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
            teamId: string;
        })[];
        members: ({
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
            athleteId: string;
            position: number;
            teamId: string;
            isReserve: boolean;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        competitionId: string;
        club: string | null;
    }>;
    debugMembers(teamId: string): Promise<{
        teamId: string;
        totalMembers: number;
        members: {
            id: string;
            position: number;
            isReserve: boolean;
            name: string;
            createdAt: Date;
        }[];
    }>;
    fixMembers(teamId: string): Promise<{
        message: string;
        count: number;
        removed?: undefined;
        kept?: undefined;
    } | {
        message: string;
        removed: number;
        kept: number;
        count?: undefined;
    }>;
    registerForEvent(registrationDto: CreateRelayTeamRegistrationDto, req: any): Promise<{
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
        team: {
            members: ({
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
                athleteId: string;
                position: number;
                teamId: string;
                isReserve: boolean;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            competitionId: string;
            club: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seedTime: string | null;
        eventId: string;
        teamId: string;
    }>;
    getEventRegistrations(eventId: string): Promise<({
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
        team: {
            registrations: ({
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
                seedTime: string | null;
                eventId: string;
                teamId: string;
            })[];
            members: ({
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
                athleteId: string;
                position: number;
                teamId: string;
                isReserve: boolean;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            competitionId: string;
            club: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seedTime: string | null;
        eventId: string;
        teamId: string;
    })[]>;
    addResult(resultDto: CreateRelayTeamResultDto): Promise<{
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
        team: {
            members: ({
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
                athleteId: string;
                position: number;
                teamId: string;
                isReserve: boolean;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            competitionId: string;
            club: string | null;
        };
    } & {
        result: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        eventId: string;
        position: number | null;
        points: number | null;
        wind: string | null;
        reaction: string | null;
        splits: import("@prisma/client/runtime/library").JsonValue | null;
        isValid: boolean;
        isDNF: boolean;
        isDNS: boolean;
        isDQ: boolean;
        isNationalRecord: boolean;
        isWorldRecord: boolean;
        selectedForDopingControl: boolean;
        dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
        teamId: string;
    }>;
    getEventResults(eventId: string): Promise<({
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
        team: {
            members: ({
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
                athleteId: string;
                position: number;
                teamId: string;
                isReserve: boolean;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            competitionId: string;
            club: string | null;
        };
    } & {
        result: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        eventId: string;
        position: number | null;
        points: number | null;
        wind: string | null;
        reaction: string | null;
        splits: import("@prisma/client/runtime/library").JsonValue | null;
        isValid: boolean;
        isDNF: boolean;
        isDNS: boolean;
        isDQ: boolean;
        isNationalRecord: boolean;
        isWorldRecord: boolean;
        selectedForDopingControl: boolean;
        dopingControlStatus: import(".prisma/client").$Enums.DopingControlStatus;
        teamId: string;
    })[]>;
}
