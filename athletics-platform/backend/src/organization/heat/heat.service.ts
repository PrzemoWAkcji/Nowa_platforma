import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHeatDto } from './dto/create-heat.dto';
import { UpdateHeatDto } from './dto/update-heat.dto';
import {
  AutoAssignDto,
  AdvancedAutoAssignDto,
  AssignmentMethodEnum,
} from './dto/auto-assign.dto';
import { EventRound, AssignmentMethod } from '@prisma/client';

@Injectable()
export class HeatService {
  constructor(private prisma: PrismaService) {}

  async create(createHeatDto: CreateHeatDto) {
    const {
      eventId,
      heatNumber,
      round,
      maxLanes,
      scheduledTime,
      notes,
      assignments,
    } = createHeatDto;

    // Sprawdź czy wydarzenie istnieje
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Sprawdź czy seria o tym numerze już istnieje dla danej rundy
    const existingHeat = await this.prisma.heat.findUnique({
      where: {
        eventId_heatNumber_round: {
          eventId,
          heatNumber,
          round: round as EventRound,
        },
      },
    });

    if (existingHeat) {
      throw new BadRequestException(
        `Heat ${heatNumber} for round ${round} already exists`,
      );
    }

    // Utwórz serię
    const heat = await this.prisma.heat.create({
      data: {
        eventId,
        heatNumber,
        round: round as EventRound,
        maxLanes: maxLanes || 20,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        notes,
        assignments: assignments
          ? {
              create: assignments.map((assignment) => ({
                registrationId: assignment.registrationId,
                lane: assignment.lane,
                seedTime: assignment.seedTime,
                seedRank: assignment.seedRank,
                assignmentMethod:
                  (assignment.assignmentMethod as AssignmentMethod) ||
                  AssignmentMethod.MANUAL,
                isPresent: assignment.isPresent !== false,
              })),
            }
          : undefined,
      },
      include: {
        event: true,
        assignments: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
          orderBy: {
            lane: 'asc',
          },
        },
      },
    });

    return heat;
  }

  async findAll(eventId?: string, round?: string) {
    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (round) where.round = round as EventRound;

    return this.prisma.heat.findMany({
      where,
      include: {
        event: true,
        assignments: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
          orderBy: {
            lane: 'asc',
          },
        },
      },
      orderBy: [{ eventId: 'asc' }, { round: 'asc' }, { heatNumber: 'asc' }],
    });
  }

  async findOne(id: string) {
    const heat = await this.prisma.heat.findUnique({
      where: { id },
      include: {
        event: true,
        assignments: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
          orderBy: {
            lane: 'asc',
          },
        },
      },
    });

    if (!heat) {
      throw new NotFoundException('Heat not found');
    }

    return heat;
  }

  async update(id: string, updateHeatDto: UpdateHeatDto) {
    const existingHeat = await this.findOne(id);

    const { assignments, ...heatData } = updateHeatDto;

    const updatedHeat = await this.prisma.heat.update({
      where: { id },
      data: {
        ...heatData,
        scheduledTime: heatData.scheduledTime
          ? new Date(heatData.scheduledTime)
          : undefined,
        round: heatData.round ? (heatData.round as EventRound) : undefined,
      },
      include: {
        event: true,
        assignments: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
          orderBy: {
            lane: 'asc',
          },
        },
      },
    });

    return updatedHeat;
  }

  async remove(id: string) {
    const heat = await this.findOne(id);

    await this.prisma.heat.delete({
      where: { id },
    });

    return { message: 'Heat deleted successfully' };
  }

  // Automatyczne rozstawienie zawodników zgodnie z przepisami PZLA
  async autoAssign(autoAssignDto: AutoAssignDto) {
    const {
      eventId,
      round,
      method,
      maxLanes = 20,
      heatsCount,
      finalistsCount,
    } = autoAssignDto;

    // Pobierz zawodników zarejestrowanych do wydarzenia
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrationEvents: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Wzbogać dane uczestników o PB i SB
    const eventName = this.getEventNameForRecords(event);
    const participants = event.registrationEvents.map((re) => {
      const athlete = re.registration.athlete;
      const personalBests = (athlete.personalBests as any) || {};
      const seasonBests = (athlete.seasonBests as any) || {};

      const personalBest = personalBests[eventName];
      const seasonBest = seasonBests[eventName];

      return {
        registrationId: re.registration.id,
        athlete,
        seedTime: re.seedTime,
        personalBest: personalBest?.result || null,
        seasonBest: seasonBest?.result || null,
      };
    });

    if (participants.length === 0) {
      throw new BadRequestException(
        'No participants registered for this event',
      );
    }

    // Usuń istniejące serie dla tej rundy
    await this.prisma.heat.deleteMany({
      where: {
        eventId,
        round: round as EventRound,
      },
    });

    let heats: any[] = [];

    switch (method) {
      case AssignmentMethodEnum.STRAIGHT_FINAL:
        heats = await this.createStraightFinal(
          eventId,
          round,
          participants,
          maxLanes,
        );
        break;
      case AssignmentMethodEnum.SEED_TIME:
        heats = await this.createSeedTimeHeats(
          eventId,
          round,
          participants,
          maxLanes,
          heatsCount,
        );
        break;
      case AssignmentMethodEnum.SERPENTINE:
        heats = await this.createSerpentineHeats(
          eventId,
          round,
          participants,
          maxLanes,
          heatsCount,
        );
        break;
      case AssignmentMethodEnum.RANDOM:
        heats = await this.createRandomHeats(
          eventId,
          round,
          participants,
          maxLanes,
          heatsCount,
        );
        break;
      case AssignmentMethodEnum.ALPHABETICAL_NUMBER:
      case AssignmentMethodEnum.ALPHABETICAL_NAME:
      case AssignmentMethodEnum.ROUND_ROBIN:
      case AssignmentMethodEnum.ZIGZAG:
      case AssignmentMethodEnum.BY_RESULT:
      case AssignmentMethodEnum.BY_RESULT_INDOOR:
        // Te metody wymagają użycia advancedAutoAssign
        throw new BadRequestException(
          'Use advanced-auto-assign endpoint for this method',
        );
        break;
      default:
        throw new BadRequestException('Invalid assignment method');
    }

    return {
      message: 'Athletes assigned successfully',
      heats: heats.length,
      participants: participants.length,
      method,
      heatsData: heats,
    };
  }

  // Finał bezpośredni (do 8 zawodników)
  private async createStraightFinal(
    eventId: string,
    round: string,
    participants: any[],
    maxLanes: number,
  ): Promise<any[]> {
    if (participants.length > maxLanes) {
      throw new BadRequestException(
        `Too many participants for straight final (max ${maxLanes})`,
      );
    }

    // Sortuj według czasów zgłoszeniowych (najlepszy w środku)
    const sortedParticipants = this.sortBySeedTime(participants);
    const laneAssignments = this.assignLanesForFinal(
      sortedParticipants,
      maxLanes,
    );

    const heat = await this.prisma.heat.create({
      data: {
        eventId,
        heatNumber: 1,
        round: round as EventRound,
        maxLanes,
        assignments: {
          create: laneAssignments.map((assignment, index) => ({
            registrationId: assignment.registrationId,
            lane: assignment.lane,
            seedTime: assignment.seedTime,
            seedRank: index + 1,
            assignmentMethod: AssignmentMethod.STRAIGHT_FINAL,
          })),
        },
      },
      include: {
        assignments: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
        },
      },
    });

    return [heat];
  }

  // Rozstawienie według czasów zgłoszeniowych
  private async createSeedTimeHeats(
    eventId: string,
    round: string,
    participants: any[],
    maxLanes: number,
    heatsCount?: number,
  ): Promise<any[]> {
    const sortedParticipants = this.sortBySeedTime(participants);
    const calculatedHeatsCount =
      heatsCount || Math.ceil(participants.length / maxLanes);

    const heats: any[] = [];

    for (let heatNum = 1; heatNum <= calculatedHeatsCount; heatNum++) {
      const startIndex = (heatNum - 1) * maxLanes;
      const endIndex = Math.min(startIndex + maxLanes, participants.length);
      const heatParticipants = sortedParticipants.slice(startIndex, endIndex);

      if (heatParticipants.length === 0) break;

      // Dla ostatniej serii (najszybszej) - rozstaw w środku
      const laneAssignments =
        heatNum === calculatedHeatsCount
          ? this.assignLanesForFinal(heatParticipants, maxLanes)
          : heatParticipants.map((p, index) => ({ ...p, lane: index + 1 }));

      const heat = await this.prisma.heat.create({
        data: {
          eventId,
          heatNumber: heatNum,
          round: round as EventRound,
          maxLanes,
          assignments: {
            create: laneAssignments.map((assignment, index) => ({
              registrationId: assignment.registrationId,
              lane: assignment.lane,
              seedTime: assignment.seedTime,
              seedRank: startIndex + index + 1,
              assignmentMethod: AssignmentMethod.SEED_TIME,
            })),
          },
        },
        include: {
          assignments: {
            include: {
              registration: {
                include: {
                  athlete: true,
                },
              },
            },
          },
        },
      });

      heats.push(heat);
    }

    return heats;
  }

  // Metoda serpentynowa (zgodnie z przepisami PZLA)
  private async createSerpentineHeats(
    eventId: string,
    round: string,
    participants: any[],
    maxLanes: number,
    heatsCount?: number,
  ): Promise<any[]> {
    const sortedParticipants = this.sortBySeedTime(participants);
    const calculatedHeatsCount =
      heatsCount || Math.ceil(participants.length / maxLanes);

    // Utwórz puste serie
    const heatGroups: any[][] = Array.from(
      { length: calculatedHeatsCount },
      () => [],
    );

    // Rozdziel zawodników metodą serpentynową
    let currentHeat = 0;
    let direction = 1; // 1 = w przód, -1 = w tył

    for (let i = 0; i < sortedParticipants.length; i++) {
      heatGroups[currentHeat].push(sortedParticipants[i]);

      if (direction === 1) {
        if (currentHeat === calculatedHeatsCount - 1) {
          direction = -1;
        } else {
          currentHeat++;
        }
      } else {
        if (currentHeat === 0) {
          direction = 1;
        } else {
          currentHeat--;
        }
      }
    }

    const heats: any[] = [];

    for (let heatNum = 0; heatNum < heatGroups.length; heatNum++) {
      const heatParticipants = heatGroups[heatNum];
      if (heatParticipants.length === 0) continue;

      const laneAssignments = this.assignLanesForFinal(
        heatParticipants,
        maxLanes,
      );

      const heat = await this.prisma.heat.create({
        data: {
          eventId,
          heatNumber: heatNum + 1,
          round: round as EventRound,
          maxLanes,
          assignments: {
            create: laneAssignments.map((assignment, index) => ({
              registrationId: assignment.registrationId,
              lane: assignment.lane,
              seedTime: assignment.seedTime,
              seedRank:
                sortedParticipants.findIndex(
                  (p) => p.registrationId === assignment.registrationId,
                ) + 1,
              assignmentMethod: AssignmentMethod.SERPENTINE,
            })),
          },
        },
        include: {
          assignments: {
            include: {
              registration: {
                include: {
                  athlete: true,
                },
              },
            },
          },
        },
      });

      heats.push(heat);
    }

    return heats;
  }

  // Losowe rozstawienie
  private async createRandomHeats(
    eventId: string,
    round: string,
    participants: any[],
    maxLanes: number,
    heatsCount?: number,
  ): Promise<any[]> {
    const shuffledParticipants = [...participants].sort(
      () => Math.random() - 0.5,
    );
    const calculatedHeatsCount =
      heatsCount || Math.ceil(participants.length / maxLanes);

    const heats: any[] = [];

    for (let heatNum = 1; heatNum <= calculatedHeatsCount; heatNum++) {
      const startIndex = (heatNum - 1) * maxLanes;
      const endIndex = Math.min(
        startIndex + maxLanes,
        shuffledParticipants.length,
      );
      const heatParticipants = shuffledParticipants.slice(startIndex, endIndex);

      if (heatParticipants.length === 0) break;

      const heat = await this.prisma.heat.create({
        data: {
          eventId,
          heatNumber: heatNum,
          round: round as EventRound,
          maxLanes,
          assignments: {
            create: heatParticipants.map((participant, index) => ({
              registrationId: participant.registrationId,
              lane: index + 1,
              seedTime: participant.seedTime,
              assignmentMethod: AssignmentMethod.RANDOM,
            })),
          },
        },
        include: {
          assignments: {
            include: {
              registration: {
                include: {
                  athlete: true,
                },
              },
            },
          },
        },
      });

      heats.push(heat);
    }

    return heats;
  }

  // Sortowanie według czasów zgłoszeniowych, PB lub SB
  private sortBySeedTime(participants: any[]) {
    return participants.sort((a, b) => {
      // Wybierz najlepszy dostępny czas dla każdego zawodnika
      const timeA = this.getBestAvailableTime(a);
      const timeB = this.getBestAvailableTime(b);

      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;

      // Konwertuj czas na sekundy dla porównania
      const secondsA = this.convertTimeToSeconds(timeA);
      const secondsB = this.convertTimeToSeconds(timeB);

      return secondsA - secondsB; // Najlepszy czas (najmniejszy) pierwszy
    });
  }

  // Wybiera najlepszy dostępny czas (seed time > SB > PB)
  private getBestAvailableTime(participant: any): string | null {
    // Priorytet: czas zgłoszeniowy > rekord sezonu > rekord życiowy
    if (participant.seedTime) return participant.seedTime;
    if (participant.seasonBest) return participant.seasonBest;
    if (participant.personalBest) return participant.personalBest;
    return null;
  }

  // Przypisanie torów dla finału (najlepszy w środku)
  private assignLanesForFinal(participants: any[], maxLanes: number) {
    const laneOrder = this.getFinalLaneOrder(maxLanes);

    return participants.map((participant, index) => ({
      ...participant,
      lane: laneOrder[index] || index + 1,
    }));
  }

  // Kolejność torów dla finału (zgodnie z przepisami PZLA)
  private getFinalLaneOrder(maxLanes: number): number[] {
    if (maxLanes === 8) {
      return [4, 5, 3, 6, 2, 7, 1, 8]; // Najlepszy na torze 4, drugi na 5, itd.
    } else if (maxLanes === 6) {
      return [3, 4, 2, 5, 1, 6];
    } else {
      // Dla innych liczb torów - środek i na zewnątrz
      const middle = Math.ceil(maxLanes / 2);
      const order = [middle];

      for (let i = 1; i < maxLanes; i++) {
        if (i % 2 === 1) {
          order.push(middle + Math.ceil(i / 2));
        } else {
          order.push(middle - i / 2);
        }
      }

      return order.filter((lane) => lane >= 1 && lane <= maxLanes);
    }
  }

  // Konwersja czasu na sekundy
  private convertTimeToSeconds(timeString: string): number {
    if (!timeString) return Infinity;

    // Obsługa różnych formatów czasu: "10.50", "1:23.45", "2:15:30.25"
    const parts = timeString.split(':');

    if (parts.length === 1) {
      // Format: "10.50" (sekundy)
      return parseFloat(parts[0]);
    } else if (parts.length === 2) {
      // Format: "1:23.45" (minuty:sekundy)
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    } else if (parts.length === 3) {
      // Format: "2:15:30.25" (godziny:minuty:sekundy)
      return (
        parseInt(parts[0]) * 3600 +
        parseInt(parts[1]) * 60 +
        parseFloat(parts[2])
      );
    }

    return Infinity;
  }

  // Pobierz wszystkie serie dla wydarzenia
  async getEventHeats(eventId: string) {
    const heats = await this.prisma.heat.findMany({
      where: { eventId },
      include: {
        event: true,
        assignments: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
          orderBy: {
            lane: 'asc',
          },
        },
      },
      orderBy: [{ round: 'asc' }, { heatNumber: 'asc' }],
    });

    return heats;
  }

  // 🏆 ZAAWANSOWANE ROZSTAWIANIE ZGODNE Z ROSTER ATHLETICS
  async advancedAutoAssign(advancedDto: AdvancedAutoAssignDto) {
    const {
      eventId,
      round,
      seriesMethod,
      laneMethod,
      maxLanes = 20,
      heatsCount,
      finalistsCount,
    } = advancedDto;

    // Pobierz zawodników zarejestrowanych do wydarzenia
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrationEvents: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const participants = event.registrationEvents.map((re) => ({
      registrationId: re.registration.id,
      athlete: re.registration.athlete,
      seedTime: re.seedTime,
      bibNumber: re.registration.bibNumber,
    }));

    if (participants.length === 0) {
      throw new BadRequestException(
        'No participants registered for this event',
      );
    }

    // Usuń istniejące serie dla tej rundy
    await this.prisma.heat.deleteMany({
      where: {
        eventId,
        round: round as EventRound,
      },
    });

    // Krok 1: Podział na serie według wybranej metody
    const seriesGroups = this.divideIntoSeries(
      participants,
      seriesMethod,
      heatsCount,
      maxLanes,
    );

    // Krok 2: Przypisanie torów w każdej serii według wybranej metody
    const heats: any[] = [];

    for (
      let seriesIndex = 0;
      seriesIndex < seriesGroups.length;
      seriesIndex++
    ) {
      const seriesParticipants = seriesGroups[seriesIndex];
      if (seriesParticipants.length === 0) continue;

      const laneAssignments = this.assignLanes(
        seriesParticipants,
        laneMethod,
        maxLanes,
      );

      const heat = await this.prisma.heat.create({
        data: {
          eventId,
          heatNumber: seriesIndex + 1,
          round: round as EventRound,
          maxLanes,
          assignments: {
            create: laneAssignments.map((assignment, index) => ({
              registrationId: assignment.registrationId,
              lane: assignment.lane,
              seedTime: assignment.seedTime,
              seedRank: assignment.seedRank || index + 1,
              assignmentMethod: laneMethod as AssignmentMethod,
            })),
          },
        },
        include: {
          assignments: {
            include: {
              registration: {
                include: {
                  athlete: true,
                },
              },
            },
          },
        },
      });

      heats.push(heat);
    }

    return {
      message: 'Advanced assignment completed successfully',
      heats: heats.length,
      participants: participants.length,
      seriesMethod,
      laneMethod,
      heatsData: heats,
    };
  }

  // 📊 METODY PODZIAŁU NA SERIE
  private divideIntoSeries(
    participants: any[],
    method: AssignmentMethodEnum,
    heatsCount?: number,
    maxLanes: number = 8,
  ): any[][] {
    const calculatedHeatsCount =
      heatsCount || Math.ceil(participants.length / maxLanes);

    switch (method) {
      case AssignmentMethodEnum.ALPHABETICAL_NUMBER:
        return this.divideAlphabeticallyByNumber(
          participants,
          calculatedHeatsCount,
        );

      case AssignmentMethodEnum.ALPHABETICAL_NAME:
        return this.divideAlphabeticallyByName(
          participants,
          calculatedHeatsCount,
        );

      case AssignmentMethodEnum.ROUND_ROBIN:
        return this.divideRoundRobin(participants, calculatedHeatsCount);

      case AssignmentMethodEnum.ZIGZAG:
        return this.divideZigzag(participants, calculatedHeatsCount);

      case AssignmentMethodEnum.BY_RESULT:
        return this.divideByResult(participants, calculatedHeatsCount);

      case AssignmentMethodEnum.BY_RESULT_INDOOR:
        return this.divideByResultIndoor(participants, calculatedHeatsCount);

      case AssignmentMethodEnum.SEED_TIME:
      default:
        return this.divideBySeedTime(
          participants,
          calculatedHeatsCount,
          maxLanes,
        );
    }
  }

  // Podział alfanumeryczny (po numerze startowym)
  private divideAlphabeticallyByNumber(
    participants: any[],
    heatsCount: number,
  ): any[][] {
    const sorted = [...participants].sort((a, b) => {
      const numA = parseInt(a.bibNumber || '999999');
      const numB = parseInt(b.bibNumber || '999999');
      return numA - numB;
    });

    return this.distributeEvenly(sorted, heatsCount);
  }

  // Podział alfabetyczny (po nazwisku)
  private divideAlphabeticallyByName(
    participants: any[],
    heatsCount: number,
  ): any[][] {
    const sorted = [...participants].sort((a, b) => {
      const nameA =
        `${a.athlete.lastName} ${a.athlete.firstName}`.toLowerCase();
      const nameB =
        `${b.athlete.lastName} ${b.athlete.firstName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return this.distributeEvenly(sorted, heatsCount);
  }

  // Podział metodą koła (round robin)
  private divideRoundRobin(participants: any[], heatsCount: number): any[][] {
    const groups: any[][] = Array.from({ length: heatsCount }, () => []);

    participants.forEach((participant, index) => {
      const groupIndex = index % heatsCount;
      groups[groupIndex].push(participant);
    });

    return groups;
  }

  // Podział zygzakiem
  private divideZigzag(participants: any[], heatsCount: number): any[][] {
    const sortedParticipants = this.sortBySeedTime(participants);
    const groups: any[][] = Array.from({ length: heatsCount }, () => []);

    let currentGroup = 0;
    let direction = 1; // 1 = w przód, -1 = w tył

    for (let i = 0; i < sortedParticipants.length; i++) {
      groups[currentGroup].push(sortedParticipants[i]);

      if (direction === 1) {
        if (currentGroup === heatsCount - 1) {
          direction = -1;
        } else {
          currentGroup++;
        }
      } else {
        if (currentGroup === 0) {
          direction = 1;
        } else {
          currentGroup--;
        }
      }
    }

    return groups;
  }

  // Podział według wyniku/czasu
  private divideByResult(participants: any[], heatsCount: number): any[][] {
    const sortedParticipants = this.sortBySeedTime(participants);
    return this.distributeEvenly(sortedParticipants, heatsCount);
  }

  // Podział według wyniku (hala) - specjalna metoda dla zawodów halowych
  private divideByResultIndoor(
    participants: any[],
    heatsCount: number,
  ): any[][] {
    const sortedParticipants = this.sortBySeedTime(participants);
    const groups: any[][] = Array.from({ length: heatsCount }, () => []);

    // Specjalny algorytm dla hali - pary najlepszych zawodników w różnych seriach
    for (let i = 0; i < sortedParticipants.length; i += 2) {
      const groupIndex = Math.floor(i / 2) % heatsCount;
      groups[groupIndex].push(sortedParticipants[i]);
      if (i + 1 < sortedParticipants.length) {
        groups[groupIndex].push(sortedParticipants[i + 1]);
      }
    }

    return groups;
  }

  // Podział według czasów zgłoszeniowych (istniejąca metoda)
  private divideBySeedTime(
    participants: any[],
    heatsCount: number,
    maxLanes: number,
  ): any[][] {
    const sortedParticipants = this.sortBySeedTime(participants);
    const groups: any[][] = [];

    for (let i = 0; i < heatsCount; i++) {
      const startIndex = i * maxLanes;
      const endIndex = Math.min(
        startIndex + maxLanes,
        sortedParticipants.length,
      );
      groups.push(sortedParticipants.slice(startIndex, endIndex));
    }

    return groups.filter((group) => group.length > 0);
  }

  // 🎯 METODY PRZYPISANIA TORÓW
  private assignLanes(
    participants: any[],
    method: AssignmentMethodEnum,
    maxLanes: number,
  ): any[] {
    switch (method) {
      case AssignmentMethodEnum.BEST_TO_WORST:
        return this.assignLanesBestToWorst(participants);

      case AssignmentMethodEnum.WORST_TO_BEST:
        return this.assignLanesWorstToBest(participants);

      case AssignmentMethodEnum.HALF_AND_HALF:
        return this.assignLanesHalfAndHalf(participants, maxLanes);

      case AssignmentMethodEnum.PAIRS:
        return this.assignLanesPairs(participants, maxLanes);

      case AssignmentMethodEnum.PAIRS_INDOOR:
        return this.assignLanesPairsIndoor(participants, maxLanes);

      case AssignmentMethodEnum.STANDARD_OUTSIDE:
        return this.assignLanesStandardOutside(participants, maxLanes);

      case AssignmentMethodEnum.STANDARD_INSIDE:
        return this.assignLanesStandardInside(participants, maxLanes);

      case AssignmentMethodEnum.WATERFALL:
        return this.assignLanesWaterfall(participants);

      case AssignmentMethodEnum.WATERFALL_REVERSE:
        return this.assignLanesWaterfallReverse(participants, maxLanes);

      case AssignmentMethodEnum.WA_HALVES_AND_PAIRS:
        return this.assignLanesWAHalvesAndPairs(participants, maxLanes);

      case AssignmentMethodEnum.WA_SPRINTS_STRAIGHT:
        return this.assignLanesWASprintsStraight(participants, maxLanes);

      case AssignmentMethodEnum.WA_200M:
        return this.assignLanesWA200M(participants, maxLanes);

      case AssignmentMethodEnum.WA_400M_800M:
        return this.assignLanesWA400M800M(participants, maxLanes);

      case AssignmentMethodEnum.WA_9_LANES:
        return this.assignLanesWA9Lanes(participants);

      case AssignmentMethodEnum.RANDOM:
        return this.assignLanesRandom(participants);

      default:
        return this.assignLanesForFinal(participants, maxLanes);
    }
  }

  // Od najlepszego do najgorszego (1-8)
  private assignLanesBestToWorst(participants: any[]): any[] {
    const sorted = this.sortBySeedTime(participants);
    return sorted.map((participant, index) => ({
      ...participant,
      lane: index + 1,
      seedRank: index + 1,
    }));
  }

  // Od najgorszego do najlepszego (8-1)
  private assignLanesWorstToBest(participants: any[]): any[] {
    const sorted = this.sortBySeedTime(participants).reverse();
    return sorted.map((participant, index) => ({
      ...participant,
      lane: index + 1,
      seedRank: participants.length - index,
    }));
  }

  // Pół na pół
  private assignLanesHalfAndHalf(participants: any[], maxLanes: number): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    // Najlepsi 4 na torach 3-6
    const best4 = sorted.slice(0, 4);
    const centerLanes = [3, 4, 5, 6];
    best4.forEach((participant, index) => {
      if (index < centerLanes.length) {
        assignments.push({
          ...participant,
          lane: centerLanes[index],
          seedRank: index + 1,
        });
      }
    });

    // Pozostali na torach 1-2 i 7-8
    const remaining = sorted.slice(4);
    const outerLanes = [1, 2, 7, 8];
    remaining.forEach((participant, index) => {
      if (index < outerLanes.length) {
        assignments.push({
          ...participant,
          lane: outerLanes[index],
          seedRank: index + 5,
        });
      }
    });

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // Pary (standardowe)
  private assignLanesPairs(participants: any[], maxLanes: number): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    const pairLanes = [
      [4, 5], // Najlepsza para na torach 4-5
      [3, 6], // Druga para na torach 3-6
      [2, 7], // Trzecia para na torach 2-7
      [1, 8], // Czwarta para na torach 1-8
    ];

    for (let i = 0; i < Math.min(sorted.length, 8); i += 2) {
      const pairIndex = Math.floor(i / 2);
      if (pairIndex < pairLanes.length) {
        const lanes = pairLanes[pairIndex];

        // Losowe przypisanie w parze
        const shuffledLanes =
          Math.random() > 0.5 ? lanes : [lanes[1], lanes[0]];

        assignments.push({
          ...sorted[i],
          lane: shuffledLanes[0],
          seedRank: i + 1,
        });

        if (i + 1 < sorted.length) {
          assignments.push({
            ...sorted[i + 1],
            lane: shuffledLanes[1],
            seedRank: i + 2,
          });
        }
      }
    }

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // Pary (hala)
  private assignLanesPairsIndoor(participants: any[], maxLanes: number): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    // Dla hali - najlepsza para na zewnętrznych torach
    const pairLanes =
      maxLanes <= 4
        ? [
            [1, 2],
            [3, 4],
          ]
        : [
            [5, 6],
            [3, 4],
            [1, 2],
          ];

    for (let i = 0; i < Math.min(sorted.length, maxLanes); i += 2) {
      const pairIndex = Math.floor(i / 2);
      if (pairIndex < pairLanes.length) {
        const lanes = pairLanes[pairIndex];

        assignments.push({
          ...sorted[i],
          lane: lanes[0],
          seedRank: i + 1,
        });

        if (i + 1 < sorted.length) {
          assignments.push({
            ...sorted[i + 1],
            lane: lanes[1],
            seedRank: i + 2,
          });
        }
      }
    }

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // Standardowo od zewnątrz
  private assignLanesStandardOutside(
    participants: any[],
    maxLanes: number,
  ): any[] {
    const sorted = this.sortBySeedTime(participants);
    const laneOrder = [1, 2, 3, 4, 5, 6, 7, 8]; // Od zewnątrz

    return sorted.map((participant, index) => ({
      ...participant,
      lane: laneOrder[index] || index + 1,
      seedRank: index + 1,
    }));
  }

  // Standardowo od wewnątrz
  private assignLanesStandardInside(
    participants: any[],
    maxLanes: number,
  ): any[] {
    const sorted = this.sortBySeedTime(participants);
    const laneOrder = [8, 7, 6, 5, 4, 3, 2, 1]; // Od wewnątrz

    return sorted.map((participant, index) => ({
      ...participant,
      lane: laneOrder[index] || maxLanes - index,
      seedRank: index + 1,
    }));
  }

  // Wodospad
  private assignLanesWaterfall(participants: any[]): any[] {
    const sorted = this.sortBySeedTime(participants);

    return sorted.map((participant, index) => ({
      ...participant,
      lane: index + 1, // Najlepszy najbliżej wewnętrznej strony
      seedRank: index + 1,
    }));
  }

  // Wodospad odwrócony
  private assignLanesWaterfallReverse(
    participants: any[],
    maxLanes: number,
  ): any[] {
    const sorted = this.sortBySeedTime(participants);

    return sorted.map((participant, index) => ({
      ...participant,
      lane: maxLanes - index, // Najlepszy najbliżej zewnętrznej strony
      seedRank: index + 1,
    }));
  }

  // World Athletics - Połówki i pary (stary standard)
  private assignLanesWAHalvesAndPairs(
    participants: any[],
    maxLanes: number,
  ): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    // Tory 3-6: Zawodnicy 1-4
    const best4 = sorted.slice(0, 4);
    const centerLanes = [3, 4, 5, 6];
    best4.forEach((participant, index) => {
      assignments.push({
        ...participant,
        lane: centerLanes[index],
        seedRank: index + 1,
      });
    });

    // Tory 7-8: Zawodnicy 5-6
    const next2 = sorted.slice(4, 6);
    [7, 8].forEach((lane, index) => {
      if (index < next2.length) {
        assignments.push({
          ...next2[index],
          lane,
          seedRank: index + 5,
        });
      }
    });

    // Tory 1-2: Zawodnicy 7-8
    const last2 = sorted.slice(6, 8);
    [1, 2].forEach((lane, index) => {
      if (index < last2.length) {
        assignments.push({
          ...last2[index],
          lane,
          seedRank: index + 7,
        });
      }
    });

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // World Athletics - sprinty (prosta)
  private assignLanesWASprintsStraight(
    participants: any[],
    maxLanes: number,
  ): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    // Tory 3-6: Zawodnicy 1-4
    const best4 = sorted.slice(0, 4);
    const centerLanes = [3, 4, 5, 6];
    best4.forEach((participant, index) => {
      assignments.push({
        ...participant,
        lane: centerLanes[index],
        seedRank: index + 1,
      });
    });

    // Tory 2 i 7: Zawodnicy 5-6
    const next2 = sorted.slice(4, 6);
    [2, 7].forEach((lane, index) => {
      if (index < next2.length) {
        assignments.push({
          ...next2[index],
          lane,
          seedRank: index + 5,
        });
      }
    });

    // Tory 1 i 8: Zawodnicy 7-8
    const last2 = sorted.slice(6, 8);
    [1, 8].forEach((lane, index) => {
      if (index < last2.length) {
        assignments.push({
          ...last2[index],
          lane,
          seedRank: index + 7,
        });
      }
    });

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // World Athletics - 200m
  private assignLanesWA200M(participants: any[], maxLanes: number): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    // Tory 5-7: Zawodnicy 1-3
    const best3 = sorted.slice(0, 3);
    [5, 6, 7].forEach((lane, index) => {
      if (index < best3.length) {
        assignments.push({
          ...best3[index],
          lane,
          seedRank: index + 1,
        });
      }
    });

    // Tory 3, 4 i 8: Zawodnicy 4-6
    const next3 = sorted.slice(3, 6);
    [3, 4, 8].forEach((lane, index) => {
      if (index < next3.length) {
        assignments.push({
          ...next3[index],
          lane,
          seedRank: index + 4,
        });
      }
    });

    // Tory 1-2: Zawodnicy 7-8
    const last2 = sorted.slice(6, 8);
    [1, 2].forEach((lane, index) => {
      if (index < last2.length) {
        assignments.push({
          ...last2[index],
          lane,
          seedRank: index + 7,
        });
      }
    });

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // World Athletics - 400m/800m
  private assignLanesWA400M800M(participants: any[], maxLanes: number): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    // Tory 4-7: Zawodnicy 1-4
    const best4 = sorted.slice(0, 4);
    [4, 5, 6, 7].forEach((lane, index) => {
      if (index < best4.length) {
        assignments.push({
          ...best4[index],
          lane,
          seedRank: index + 1,
        });
      }
    });

    // Tory 3 i 8: Zawodnicy 5-6
    const next2 = sorted.slice(4, 6);
    [3, 8].forEach((lane, index) => {
      if (index < next2.length) {
        assignments.push({
          ...next2[index],
          lane,
          seedRank: index + 5,
        });
      }
    });

    // Tory 1-2: Zawodnicy 7-8
    const last2 = sorted.slice(6, 8);
    [1, 2].forEach((lane, index) => {
      if (index < last2.length) {
        assignments.push({
          ...last2[index],
          lane,
          seedRank: index + 7,
        });
      }
    });

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // World Athletics - 9 torów
  private assignLanesWA9Lanes(participants: any[]): any[] {
    const sorted = this.sortBySeedTime(participants);
    const assignments: any[] = [];

    // Tory 4-6: Zawodnicy 1-3
    const best3 = sorted.slice(0, 3);
    [4, 5, 6].forEach((lane, index) => {
      if (index < best3.length) {
        assignments.push({
          ...best3[index],
          lane,
          seedRank: index + 1,
        });
      }
    });

    // Tory 3 i 7: Zawodnicy 4-5
    const next2 = sorted.slice(3, 5);
    [3, 7].forEach((lane, index) => {
      if (index < next2.length) {
        assignments.push({
          ...next2[index],
          lane,
          seedRank: index + 4,
        });
      }
    });

    // Tory 2 i 8: Zawodnicy 6-7
    const next2_2 = sorted.slice(5, 7);
    [2, 8].forEach((lane, index) => {
      if (index < next2_2.length) {
        assignments.push({
          ...next2_2[index],
          lane,
          seedRank: index + 6,
        });
      }
    });

    // Tory 1 i 9: Zawodnicy 8-9
    const last2 = sorted.slice(7, 9);
    [1, 9].forEach((lane, index) => {
      if (index < last2.length) {
        assignments.push({
          ...last2[index],
          lane,
          seedRank: index + 8,
        });
      }
    });

    return assignments.sort((a, b) => a.lane - b.lane);
  }

  // Losowe przypisanie torów
  private assignLanesRandom(participants: any[]): any[] {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    return shuffled.map((participant, index) => ({
      ...participant,
      lane: index + 1,
      seedRank:
        participants.findIndex(
          (p) => p.registrationId === participant.registrationId,
        ) + 1,
    }));
  }

  // 🔧 METODY POMOCNICZE
  private distributeEvenly(participants: any[], heatsCount: number): any[][] {
    const groups: any[][] = Array.from({ length: heatsCount }, () => []);
    const participantsPerHeat = Math.ceil(participants.length / heatsCount);

    for (let i = 0; i < participants.length; i++) {
      const groupIndex = Math.floor(i / participantsPerHeat);
      if (groupIndex < heatsCount) {
        groups[groupIndex].push(participants[i]);
      }
    }

    return groups.filter((group) => group.length > 0);
  }

  /**
   * Mapuje nazwę wydarzenia na standardową nazwę konkurencji dla rekordów
   */
  private getEventNameForRecords(event: any): string {
    const eventName = event.name.toUpperCase();

    // Biegi
    if (
      eventName.includes('100') &&
      eventName.includes('M') &&
      !eventName.includes('H')
    )
      return '100M';
    if (eventName.includes('200') && eventName.includes('M')) return '200M';
    if (
      eventName.includes('400') &&
      eventName.includes('M') &&
      !eventName.includes('H')
    )
      return '400M';
    if (eventName.includes('800') && eventName.includes('M')) return '800M';
    if (eventName.includes('1500') && eventName.includes('M')) return '1500M';
    if (
      eventName.includes('3000') &&
      eventName.includes('M') &&
      !eventName.includes('SC')
    )
      return '3000M';
    if (eventName.includes('5000') && eventName.includes('M')) return '5000M';
    if (eventName.includes('10000') && eventName.includes('M')) return '10000M';

    // Płotki
    if (eventName.includes('110') && eventName.includes('H')) return '110MH';
    if (eventName.includes('100') && eventName.includes('H')) return '100MH';
    if (eventName.includes('400') && eventName.includes('H')) return '400MH';
    if (eventName.includes('80') && eventName.includes('H')) return '80MH';

    // Biegi specjalne
    if (eventName.includes('600') && eventName.includes('M')) return '600M';
    if (eventName.includes('1000') && eventName.includes('M')) return '1000M';
    if (eventName.includes('3000') && eventName.includes('SC'))
      return '3000MSC';

    // Skoki
    if (eventName.includes('LONG') || eventName.includes('SKOK W DAL'))
      return 'LJ';
    if (eventName.includes('HIGH') || eventName.includes('SKOK WZWYŻ'))
      return 'HJ';
    if (eventName.includes('POLE') || eventName.includes('SKOK O TYCZCE'))
      return 'PV';
    if (eventName.includes('TRIPLE') || eventName.includes('TRÓJSKOK'))
      return 'TJ';

    // Rzuty
    if (eventName.includes('SHOT') || eventName.includes('PCHNIĘCIE KULĄ')) {
      if (eventName.includes('3KG') || eventName.includes('3 KG')) return 'SP3';
      if (eventName.includes('5KG') || eventName.includes('5 KG')) return 'SP5';
      return 'SP';
    }
    if (eventName.includes('DISCUS') || eventName.includes('RZUT DYSKIEM'))
      return 'DT';
    if (eventName.includes('HAMMER') || eventName.includes('RZUT MŁOTEM'))
      return 'HT';
    if (eventName.includes('JAVELIN') || eventName.includes('RZUT OSZCZEPEM'))
      return 'JT';

    return event.name;
  }
}
