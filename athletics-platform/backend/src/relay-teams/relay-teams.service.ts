import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddRelayTeamMemberDto,
  CreateRelayTeamDto,
  CreateRelayTeamRegistrationDto,
  CreateRelayTeamResultDto,
  UpdateRelayTeamDto,
} from './dto';

@Injectable()
export class RelayTeamsService {
  private readonly logger = new Logger(RelayTeamsService.name);

  constructor(private prisma: PrismaService) {}

  // Sprawdź uprawnienia do edycji zespołu i zwróć zespół
  private async checkEditPermissionsAndGetTeam(teamId: string, userId: string) {
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
      throw new NotFoundException('Zespół nie został znaleziony');
    }

    // Pobierz dane użytkownika
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Użytkownik nie został znaleziony');
    }

    // Sprawdź uprawnienia: ADMIN, ORGANIZER, COACH lub twórca zespołu
    const hasPermission =
      user.role === 'ADMIN' ||
      user.role === 'ORGANIZER' ||
      user.role === 'COACH' ||
      team.createdById === userId;

    if (!hasPermission) {
      throw new BadRequestException(
        'Nie masz uprawnień do edycji tego zespołu',
      );
    }

    return team;
  }

  // Sprawdź uprawnienia do edycji zespołu (bez zwracania zespołu)
  private async checkEditPermissions(
    teamId: string,
    userId: string,
  ): Promise<void> {
    await this.checkEditPermissionsAndGetTeam(teamId, userId);
  }

  // Tworzenie zespołu sztafetowego
  async create(createRelayTeamDto: CreateRelayTeamDto, userId: string) {
    const { name, club, competitionId } = createRelayTeamDto;

    // Sprawdź czy zawody istnieją
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Zawody nie zostały znalezione');
    }

    // Sprawdź czy nazwa zespołu jest unikalna w ramach zawodów
    const existingTeam = await this.prisma.relayTeam.findFirst({
      where: {
        name,
        competitionId,
      },
    });

    if (existingTeam) {
      throw new BadRequestException(
        'Zespół o tej nazwie już istnieje w tych zawodach',
      );
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

  // Pobieranie wszystkich zespołów dla zawodów
  async findByCompetition(competitionId: string) {
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

  // Pobieranie zespołu po ID
  async findOne(id: string) {
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
      throw new NotFoundException('Zespół sztafetowy nie został znaleziony');
    }

    return team;
  }

  // Aktualizacja zespołu
  async update(
    id: string,
    updateRelayTeamDto: UpdateRelayTeamDto,
    userId: string,
  ) {
    // Sprawdź uprawnienia
    await this.checkEditPermissions(id, userId);

    const team = await this.findOne(id);

    // Jeśli zmieniana jest nazwa, sprawdź unikalność
    if (updateRelayTeamDto.name && updateRelayTeamDto.name !== team.name) {
      const existingTeam = await this.prisma.relayTeam.findFirst({
        where: {
          name: updateRelayTeamDto.name,
          competitionId: team.competitionId,
          id: { not: id },
        },
      });

      if (existingTeam) {
        throw new BadRequestException(
          'Zespół o tej nazwie już istnieje w tych zawodach',
        );
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

  // Usuwanie zespołu
  async remove(id: string, userId: string) {
    // Sprawdź uprawnienia
    await this.checkEditPermissions(id, userId);

    const team = await this.findOne(id);

    // Sprawdź czy zespół ma już wyniki
    if (team.results.length > 0) {
      throw new BadRequestException(
        'Nie można usunąć zespołu, który ma już wyniki',
      );
    }

    return this.prisma.relayTeam.delete({
      where: { id },
    });
  }

  // Dodawanie członka zespołu
  async addMember(
    teamId: string,
    addMemberDto: AddRelayTeamMemberDto,
    userId: string,
  ) {
    // Sprawdź uprawnienia i pobierz zespół
    const team = await this.checkEditPermissionsAndGetTeam(teamId, userId);

    const { athleteId, position, isReserve } = addMemberDto;

    // Sprawdź czy zawodnik istnieje
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId },
    });

    if (!athlete) {
      throw new NotFoundException('Zawodnik nie został znaleziony');
    }

    // Sprawdź czy zawodnik nie jest już w zespole (używając już pobranego zespołu)
    const existingMember = team.members.find(
      (member) => member.athleteId === athleteId,
    );
    if (existingMember) {
      throw new BadRequestException('Zawodnik jest już członkiem tego zespołu');
    }

    // Sprawdź czy pozycja nie jest zajęta (używając już pobranego zespołu)
    const existingPosition = team.members.find(
      (member) => member.position === position,
    );
    if (existingPosition) {
      throw new BadRequestException('Ta pozycja jest już zajęta');
    }

    // Sprawdź limity (4 podstawowych + 2 rezerwowych) (używając już pobranego zespołu)
    if (team.members.length >= 6) {
      throw new BadRequestException(
        'Zespół może mieć maksymalnie 6 członków (4 podstawowych + 2 rezerwowych)',
      );
    }

    // Sprawdź czy pozycja jest odpowiednia dla typu członka
    if (isReserve && position <= 4) {
      throw new BadRequestException('Rezerwowi powinni mieć pozycje 5-6');
    }

    if (!isReserve && position > 4) {
      throw new BadRequestException(
        'Podstawowi członkowie powinni mieć pozycje 1-4',
      );
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

  // Usuwanie członka zespołu
  async removeMember(teamId: string, memberId: string, userId: string) {
    // Sprawdź uprawnienia
    await this.checkEditPermissions(teamId, userId);

    const member = await this.prisma.relayTeamMember.findUnique({
      where: { id: memberId },
      include: {
        team: true,
        athlete: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Członek zespołu nie został znaleziony');
    }

    if (member.teamId !== teamId) {
      throw new NotFoundException('Członek zespołu nie został znaleziony');
    }

    const removedPosition = member.position;

    // Usuń członka
    await this.prisma.relayTeamMember.delete({
      where: { id: memberId },
    });

    // Przeporządkuj pozycje pozostałych członków
    // Wszyscy członkowie z pozycją większą niż usunięty członek przesuwają się o 1 w dół
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

    // Zwróć zaktualizowany zespół z nowymi pozycjami
    const updatedTeam = await this.findOne(teamId);
    this.logger.debug(
      `Relay team updated: ${teamId}, members: ${updatedTeam.members?.length}`,
    );
    return updatedTeam;
  }

  // DEBUG: Sprawdź członków zespołu
  async debugMembers(teamId: string) {
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

  // NAPRAW: Usuń nadmiarowych członków zespołu (pozostaw tylko pierwszych 6)
  async fixTeamMembers(teamId: string) {
    const members = await this.prisma.relayTeamMember.findMany({
      where: { teamId },
      orderBy: {
        createdAt: 'asc', // Zachowaj najstarszych członków
      },
    });

    if (members.length <= 6) {
      return {
        message: 'Zespół ma prawidłową liczbę członków',
        count: members.length,
      };
    }

    // Usuń nadmiarowych członków (zachowaj pierwszych 6)
    const membersToKeep = members.slice(0, 6);
    const membersToRemove = members.slice(6);

    // Usuń nadmiarowych członków
    await this.prisma.relayTeamMember.deleteMany({
      where: {
        id: {
          in: membersToRemove.map((m) => m.id),
        },
      },
    });

    // Przeporządkuj pozycje pozostałych członków
    for (let i = 0; i < membersToKeep.length; i++) {
      await this.prisma.relayTeamMember.update({
        where: { id: membersToKeep[i].id },
        data: {
          position: i + 1,
          isReserve: i >= 4, // Pozycje 5-6 to rezerwowi
        },
      });
    }

    return {
      message: 'Naprawiono zespół',
      removed: membersToRemove.length,
      kept: membersToKeep.length,
    };
  }

  // Rejestracja zespołu do konkurencji
  async registerForEvent(
    registrationDto: CreateRelayTeamRegistrationDto,
    userId: string,
  ) {
    const { teamId, eventId, seedTime } = registrationDto;

    // Sprawdź uprawnienia
    await this.checkEditPermissions(teamId, userId);

    const team = await this.findOne(teamId);

    // Sprawdź czy konkurencja istnieje i czy to sztafeta
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Konkurencja nie została znalezione');
    }

    if (event.type !== 'RELAY') {
      throw new BadRequestException(
        'Zespoły sztafetowe mogą być rejestrowane tylko do konkurencji sztafetowych',
      );
    }

    // Sprawdź czy zespół nie jest już zarejestrowany
    const existingRegistration =
      await this.prisma.relayTeamRegistration.findFirst({
        where: {
          teamId,
          eventId,
        },
      });

    if (existingRegistration) {
      throw new BadRequestException(
        'Zespół jest już zarejestrowany do tej konkurencji',
      );
    }

    // Sprawdź czy zespół ma wystarczającą liczbę członków (minimum 4)
    const memberCount = await this.prisma.relayTeamMember.count({
      where: {
        teamId,
        isReserve: false,
      },
    });

    if (memberCount < 4) {
      throw new BadRequestException(
        'Zespół musi mieć co najmniej 4 podstawowych członków',
      );
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

  // Pobieranie rejestracji zespołów dla konkurencji
  async getEventRegistrations(eventId: string) {
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

  // Dodawanie wyniku zespołu
  async addResult(resultDto: CreateRelayTeamResultDto) {
    const { teamId, eventId } = resultDto;

    // Sprawdź czy zespół jest zarejestrowany do konkurencji
    const registration = await this.prisma.relayTeamRegistration.findFirst({
      where: {
        teamId,
        eventId,
      },
    });

    if (!registration) {
      throw new BadRequestException(
        'Zespół nie jest zarejestrowany do tej konkurencji',
      );
    }

    // Sprawdź czy wynik już istnieje
    const existingResult = await this.prisma.relayTeamResult.findFirst({
      where: {
        teamId,
        eventId,
      },
    });

    if (existingResult) {
      throw new BadRequestException('Wynik dla tego zespołu już istnieje');
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

  // Pobieranie wyników dla konkurencji
  async getEventResults(eventId: string) {
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
}
