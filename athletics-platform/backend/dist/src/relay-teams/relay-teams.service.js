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
var RelayTeamsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayTeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RelayTeamsService = RelayTeamsService_1 = class RelayTeamsService {
    prisma;
    logger = new common_1.Logger(RelayTeamsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkEditPermissionsAndGetTeam(teamId, userId) {
        const team = await this.prisma.relayTeam.findUnique({
            where: { id: teamId },
            include: {
                members: {
                    include: {
                        athlete: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                club: true,
                                dateOfBirth: true,
                            },
                        },
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
                competition: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
                registrations: {
                    include: {
                        event: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                    },
                },
                results: true,
            },
        });
        if (!team) {
            throw new common_1.NotFoundException('Zespół nie został znaleziony');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Użytkownik nie został znaleziony');
        }
        const hasPermission = user.role === 'ADMIN' ||
            user.role === 'ORGANIZER' ||
            user.role === 'COACH' ||
            team.createdById === userId;
        if (!hasPermission) {
            throw new common_1.BadRequestException('Nie masz uprawnień do edycji tego zespołu');
        }
        return team;
    }
    async checkEditPermissions(teamId, userId) {
        await this.checkEditPermissionsAndGetTeam(teamId, userId);
    }
    async create(createRelayTeamDto, userId) {
        const { name, club, competitionId } = createRelayTeamDto;
        const competition = await this.prisma.competition.findUnique({
            where: { id: competitionId },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Zawody nie zostały znalezione');
        }
        const existingTeam = await this.prisma.relayTeam.findFirst({
            where: {
                name,
                competitionId,
            },
        });
        if (existingTeam) {
            throw new common_1.BadRequestException('Zespół o tej nazwie już istnieje w tych zawodach');
        }
        return this.prisma.relayTeam.create({
            data: {
                name,
                club,
                competitionId,
                createdById: userId,
            },
            include: {
                competition: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        athlete: true,
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
                registrations: {
                    include: {
                        event: true,
                    },
                },
                results: {
                    include: {
                        event: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        registrations: true,
                        results: true,
                    },
                },
            },
        });
    }
    async findByCompetition(competitionId) {
        return this.prisma.relayTeam.findMany({
            where: { competitionId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        athlete: true,
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
                registrations: {
                    include: {
                        event: true,
                    },
                },
                results: {
                    include: {
                        event: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        registrations: true,
                        results: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findOne(id) {
        const team = await this.prisma.relayTeam.findUnique({
            where: { id },
            include: {
                competition: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        athlete: true,
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
                registrations: {
                    include: {
                        event: true,
                    },
                },
                results: {
                    include: {
                        event: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        registrations: true,
                        results: true,
                    },
                },
            },
        });
        if (!team) {
            throw new common_1.NotFoundException('Zespół sztafetowy nie został znaleziony');
        }
        return team;
    }
    async update(id, updateRelayTeamDto, userId) {
        await this.checkEditPermissions(id, userId);
        const team = await this.findOne(id);
        if (updateRelayTeamDto.name && updateRelayTeamDto.name !== team.name) {
            const existingTeam = await this.prisma.relayTeam.findFirst({
                where: {
                    name: updateRelayTeamDto.name,
                    competitionId: team.competitionId,
                    id: { not: id },
                },
            });
            if (existingTeam) {
                throw new common_1.BadRequestException('Zespół o tej nazwie już istnieje w tych zawodach');
            }
        }
        return this.prisma.relayTeam.update({
            where: { id },
            data: updateRelayTeamDto,
            include: {
                competition: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        athlete: true,
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
                registrations: {
                    include: {
                        event: true,
                    },
                },
                results: {
                    include: {
                        event: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        registrations: true,
                        results: true,
                    },
                },
            },
        });
    }
    async remove(id, userId) {
        await this.checkEditPermissions(id, userId);
        const team = await this.findOne(id);
        if (team.results.length > 0) {
            throw new common_1.BadRequestException('Nie można usunąć zespołu, który ma już wyniki');
        }
        return this.prisma.relayTeam.delete({
            where: { id },
        });
    }
    async addMember(teamId, addMemberDto, userId) {
        const team = await this.checkEditPermissionsAndGetTeam(teamId, userId);
        const { athleteId, position, isReserve } = addMemberDto;
        const athlete = await this.prisma.athlete.findUnique({
            where: { id: athleteId },
        });
        if (!athlete) {
            throw new common_1.NotFoundException('Zawodnik nie został znaleziony');
        }
        const existingMember = team.members.find((member) => member.athleteId === athleteId);
        if (existingMember) {
            throw new common_1.BadRequestException('Zawodnik jest już członkiem tego zespołu');
        }
        const existingPosition = team.members.find((member) => member.position === position);
        if (existingPosition) {
            throw new common_1.BadRequestException('Ta pozycja jest już zajęta');
        }
        if (team.members.length >= 6) {
            throw new common_1.BadRequestException('Zespół może mieć maksymalnie 6 członków (4 podstawowych + 2 rezerwowych)');
        }
        if (isReserve && position <= 4) {
            throw new common_1.BadRequestException('Rezerwowi powinni mieć pozycje 5-6');
        }
        if (!isReserve && position > 4) {
            throw new common_1.BadRequestException('Podstawowi członkowie powinni mieć pozycje 1-4');
        }
        return this.prisma.relayTeamMember.create({
            data: {
                teamId,
                athleteId,
                position,
                isReserve: isReserve || false,
            },
            include: {
                athlete: true,
                team: {
                    include: {
                        members: {
                            include: {
                                athlete: true,
                            },
                            orderBy: {
                                position: 'asc',
                            },
                        },
                    },
                },
            },
        });
    }
    async removeMember(teamId, memberId, userId) {
        await this.checkEditPermissions(teamId, userId);
        const member = await this.prisma.relayTeamMember.findUnique({
            where: { id: memberId },
            include: {
                team: true,
                athlete: true,
            },
        });
        if (!member) {
            throw new common_1.NotFoundException('Członek zespołu nie został znaleziony');
        }
        if (member.teamId !== teamId) {
            throw new common_1.NotFoundException('Członek zespołu nie został znaleziony');
        }
        const removedPosition = member.position;
        await this.prisma.relayTeamMember.delete({
            where: { id: memberId },
        });
        await this.prisma.relayTeamMember.updateMany({
            where: {
                teamId: teamId,
                position: {
                    gt: removedPosition,
                },
            },
            data: {
                position: {
                    decrement: 1,
                },
            },
        });
        const updatedTeam = await this.findOne(teamId);
        this.logger.debug(`Relay team updated: ${teamId}, members: ${updatedTeam.members?.length}`);
        return updatedTeam;
    }
    async debugMembers(teamId) {
        const members = await this.prisma.relayTeamMember.findMany({
            where: { teamId },
            include: {
                athlete: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                position: 'asc',
            },
        });
        return {
            teamId,
            totalMembers: members.length,
            members: members.map((m) => ({
                id: m.id,
                position: m.position,
                isReserve: m.isReserve,
                name: `${m.athlete.firstName} ${m.athlete.lastName}`,
                createdAt: m.createdAt,
            })),
        };
    }
    async fixTeamMembers(teamId) {
        const members = await this.prisma.relayTeamMember.findMany({
            where: { teamId },
            orderBy: {
                createdAt: 'asc',
            },
        });
        if (members.length <= 6) {
            return {
                message: 'Zespół ma prawidłową liczbę członków',
                count: members.length,
            };
        }
        const membersToKeep = members.slice(0, 6);
        const membersToRemove = members.slice(6);
        await this.prisma.relayTeamMember.deleteMany({
            where: {
                id: {
                    in: membersToRemove.map((m) => m.id),
                },
            },
        });
        for (let i = 0; i < membersToKeep.length; i++) {
            await this.prisma.relayTeamMember.update({
                where: { id: membersToKeep[i].id },
                data: {
                    position: i + 1,
                    isReserve: i >= 4,
                },
            });
        }
        return {
            message: 'Naprawiono zespół',
            removed: membersToRemove.length,
            kept: membersToKeep.length,
        };
    }
    async registerForEvent(registrationDto, userId) {
        const { teamId, eventId, seedTime } = registrationDto;
        await this.checkEditPermissions(teamId, userId);
        const team = await this.findOne(teamId);
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Konkurencja nie została znalezione');
        }
        if (event.type !== 'RELAY') {
            throw new common_1.BadRequestException('Zespoły sztafetowe mogą być rejestrowane tylko do konkurencji sztafetowych');
        }
        const existingRegistration = await this.prisma.relayTeamRegistration.findFirst({
            where: {
                teamId,
                eventId,
            },
        });
        if (existingRegistration) {
            throw new common_1.BadRequestException('Zespół jest już zarejestrowany do tej konkurencji');
        }
        const memberCount = await this.prisma.relayTeamMember.count({
            where: {
                teamId,
                isReserve: false,
            },
        });
        if (memberCount < 4) {
            throw new common_1.BadRequestException('Zespół musi mieć co najmniej 4 podstawowych członków');
        }
        return this.prisma.relayTeamRegistration.create({
            data: {
                teamId,
                eventId,
                seedTime,
            },
            include: {
                team: {
                    include: {
                        members: {
                            include: {
                                athlete: true,
                            },
                            orderBy: {
                                position: 'asc',
                            },
                        },
                    },
                },
                event: true,
            },
        });
    }
    async getEventRegistrations(eventId) {
        return this.prisma.relayTeamRegistration.findMany({
            where: { eventId },
            include: {
                team: {
                    include: {
                        members: {
                            include: {
                                athlete: true,
                            },
                            orderBy: {
                                position: 'asc',
                            },
                        },
                        registrations: {
                            include: {
                                event: true,
                            },
                        },
                    },
                },
                event: true,
            },
            orderBy: [{ seedTime: 'asc' }, { team: { name: 'asc' } }],
        });
    }
    async addResult(resultDto) {
        const { teamId, eventId } = resultDto;
        const registration = await this.prisma.relayTeamRegistration.findFirst({
            where: {
                teamId,
                eventId,
            },
        });
        if (!registration) {
            throw new common_1.BadRequestException('Zespół nie jest zarejestrowany do tej konkurencji');
        }
        const existingResult = await this.prisma.relayTeamResult.findFirst({
            where: {
                teamId,
                eventId,
            },
        });
        if (existingResult) {
            throw new common_1.BadRequestException('Wynik dla tego zespołu już istnieje');
        }
        return this.prisma.relayTeamResult.create({
            data: resultDto,
            include: {
                team: {
                    include: {
                        members: {
                            include: {
                                athlete: true,
                            },
                            orderBy: {
                                position: 'asc',
                            },
                        },
                    },
                },
                event: true,
            },
        });
    }
    async getEventResults(eventId) {
        return this.prisma.relayTeamResult.findMany({
            where: { eventId },
            include: {
                team: {
                    include: {
                        members: {
                            include: {
                                athlete: true,
                            },
                            orderBy: {
                                position: 'asc',
                            },
                        },
                    },
                },
                event: true,
            },
            orderBy: [{ position: 'asc' }, { result: 'asc' }],
        });
    }
};
exports.RelayTeamsService = RelayTeamsService;
exports.RelayTeamsService = RelayTeamsService = RelayTeamsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RelayTeamsService);
//# sourceMappingURL=relay-teams.service.js.map