import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventType, Gender, Category } from '@prisma/client';

interface EventTemplate {
  name: string;
  type: EventType;
  gender: Gender;
  category: Category;
  distance?: string;
  discipline?: string;
  estimatedDuration: number; // w minutach
  requiresHeats: boolean;
  maxParticipantsPerHeat: number;
  isFieldEvent: boolean;
}

interface LocalScheduleGeneratorOptions {
  competitionId: string;
  startTime: Date;
  trackEvents?: EventTemplate[];
  fieldEvents?: EventTemplate[];
  breakDuration: number; // przerwa między konkurencjami w minutach
  parallelFieldEvents: boolean; // czy konkurencje techniczne mogą odbywać się równolegle
  separateCombinedEvents: boolean; // czy wieloboje mają być osobno
  selectedEventIds?: string[]; // wybrane wydarzenia do programu
}

@Injectable()
export class ScheduleGeneratorService {
  constructor(private prisma: PrismaService) {}

  // Generuj automatyczny program minutowy na podstawie zarejestrowanych wydarzeń
  async generateSchedule(options: LocalScheduleGeneratorOptions) {
    const {
      competitionId,
      startTime,
      breakDuration = 15,
      parallelFieldEvents = true,
      separateCombinedEvents = true,
      selectedEventIds,
    } = options;

    // Pobierz wszystkie wydarzenia dla zawodów
    const events = await this.prisma.event.findMany({
      where: {
        competitionId,
        ...(selectedEventIds && selectedEventIds.length > 0
          ? { id: { in: selectedEventIds } }
          : {}),
      },
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
      orderBy: [{ type: 'asc' }, { gender: 'asc' }, { category: 'asc' }],
    });

    if (events.length === 0) {
      throw new Error('No events found for this competition');
    }

    // Podziel wydarzenia na kategorie
    const trackEvents = events.filter((e) => e.type === EventType.TRACK);
    const fieldEvents = events.filter((e) => e.type === EventType.FIELD);
    const combinedEvents = events.filter((e) => e.type === EventType.COMBINED);

    // Generuj harmonogram
    const scheduleItems: any[] = [];
    let currentTime = new Date(startTime);

    // Jeśli wieloboje mają być osobno, zaplanuj je na końcu
    const eventsToSchedule = separateCombinedEvents
      ? [...trackEvents, ...fieldEvents]
      : [...trackEvents, ...fieldEvents, ...combinedEvents];

    // Grupuj wydarzenia według czasu i typu
    const eventGroups = this.groupEventsForScheduling(
      eventsToSchedule,
      parallelFieldEvents,
    );

    for (const group of eventGroups) {
      const groupStartTime = new Date(currentTime);
      let maxDuration = 0;

      for (const event of group) {
        const participantsCount = event.registrationEvents.length;
        const estimatedDuration = this.calculateEventDuration(
          event,
          participantsCount,
        );

        // Określ liczbę serii i finalistów
        const { seriesCount, finalistsCount, rounds } =
          this.calculateEventStructure(event, participantsCount);

        // Dodaj rundy do harmonogramu
        for (const round of rounds) {
          scheduleItems.push({
            eventId: event.id,
            scheduledTime: new Date(groupStartTime),
            duration: round.duration,
            round: round.type,
            seriesCount: round.seriesCount,
            finalistsCount: round.finalistsCount,
            notes: this.generateEventNotes(event, participantsCount, round),
          });

          // Jeśli to nie jest wydarzenie techniczne równoległe, przesuń czas
          if (event.type !== EventType.FIELD || !parallelFieldEvents) {
            currentTime = new Date(
              currentTime.getTime() + round.duration * 60000,
            );
          }
        }

        maxDuration = Math.max(maxDuration, estimatedDuration);
      }

      // Jeśli wydarzenia techniczne odbywają się równolegle, przesuń czas o najdłuższe wydarzenie
      if (
        parallelFieldEvents &&
        group.some((e) => e.type === EventType.FIELD)
      ) {
        currentTime = new Date(groupStartTime.getTime() + maxDuration * 60000);
      }

      // Dodaj przerwę między grupami wydarzeń
      currentTime = new Date(currentTime.getTime() + breakDuration * 60000);
    }

    // Dodaj wieloboje na końcu jeśli są oddzielne
    if (separateCombinedEvents && combinedEvents.length > 0) {
      // Dodaj dłuższą przerwę przed wielobojami
      currentTime = new Date(currentTime.getTime() + 30 * 60000);

      for (const event of combinedEvents) {
        const participantsCount = event.registrationEvents.length;
        const duration = this.calculateEventDuration(event, participantsCount);

        scheduleItems.push({
          eventId: event.id,
          scheduledTime: new Date(currentTime),
          duration,
          round: 'FINAL',
          seriesCount: 1,
          finalistsCount: null,
          notes: `Wielobój - ${participantsCount} zawodników`,
        });

        currentTime = new Date(
          currentTime.getTime() + duration * 60000 + breakDuration * 60000,
        );
      }
    }

    return scheduleItems;
  }

  // Grupuj wydarzenia do równoległego planowania
  private groupEventsForScheduling(
    events: any[],
    parallelFieldEvents: boolean,
  ) {
    if (!parallelFieldEvents) {
      return events.map((event) => [event]);
    }

    const groups: any[] = [];
    const trackEvents = events.filter((e) => e.type === EventType.TRACK);
    const fieldEvents = events.filter((e) => e.type === EventType.FIELD);

    // Najpierw dodaj wszystkie biegi jako osobne grupy
    for (const trackEvent of trackEvents) {
      groups.push([trackEvent]);
    }

    // Następnie grupuj wydarzenia techniczne, które mogą odbywać się równolegle
    const fieldGroups = this.groupFieldEvents(fieldEvents);
    groups.push(...fieldGroups);

    return groups;
  }

  // Grupuj wydarzenia techniczne według możliwości równoległego przeprowadzenia
  private groupFieldEvents(
    fieldEvents: Array<{ discipline?: string; name: string }>,
  ) {
    interface EventGroup {
      events: Array<{ discipline?: string; name: string }>;
      type: string;
    }

    const groups: EventGroup[] = [];
    const jumps = fieldEvents.filter(
      (e) =>
        e.discipline?.includes('jump') ||
        e.name.toLowerCase().includes('skok') ||
        e.name.toLowerCase().includes('wzwyż') ||
        e.name.toLowerCase().includes('dal'),
    );
    const throws = fieldEvents.filter(
      (e) =>
        e.discipline?.includes('throw') ||
        e.name.toLowerCase().includes('rzut') ||
        e.name.toLowerCase().includes('kula') ||
        e.name.toLowerCase().includes('dysk'),
    );

    // Skoki mogą odbywać się równolegle (różne sektory)
    if (jumps.length > 0) {
      // Grupuj skoki według kategorii wiekowych i płci
      const jumpGroups = this.groupByAgeAndGender(jumps as any);
      groups.push(...(jumpGroups as any));
    }

    // Rzuty mogą odbywać się równolegle (różne sektory)
    if (throws.length > 0) {
      const throwGroups = this.groupByAgeAndGender(throws as any);
      groups.push(...(throwGroups as any));
    }

    return groups;
  }

  // Grupuj według wieku i płci
  private groupByAgeAndGender(
    events: Array<{ gender?: string; category?: string }>,
  ) {
    const groups = new Map<
      string,
      Array<{ gender?: string; category?: string }>
    >();

    for (const event of events) {
      const key = `${event.gender}_${event.category}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(event);
    }

    return Array.from(groups.values());
  }

  // Oblicz strukturę wydarzenia (eliminacje, półfinały, finały)
  private calculateEventStructure(
    event: { type: string; distance?: string; name?: string },
    participantsCount: number,
  ) {
    const maxLanes = 8; // Standardowa liczba torów
    interface Round {
      type: string;
      seriesCount: number;
      finalistsCount: number | null;
      duration: number;
    }

    const rounds: Round[] = [];
    let finalistsCount: number | null = null;

    if (event.type === EventType.TRACK) {
      if (participantsCount <= maxLanes) {
        // Finał bezpośredni
        rounds.push({
          type: 'FINAL',
          seriesCount: 1,
          finalistsCount: null,
          duration: this.getBaseDuration(event),
        });
      } else if (participantsCount <= 16) {
        // Eliminacje + finał
        const heatsCount = Math.ceil(participantsCount / maxLanes);
        rounds.push({
          type: 'QUALIFICATION',
          seriesCount: heatsCount,
          finalistsCount: 8,
          duration: heatsCount * this.getBaseDuration(event),
        });
        rounds.push({
          type: 'FINAL',
          seriesCount: 1,
          finalistsCount: null,
          duration: this.getBaseDuration(event),
        });
        finalistsCount = 8;
      } else {
        // Eliminacje + półfinały + finał
        const qualHeats = Math.ceil(participantsCount / maxLanes);
        const semifinalists = 16;
        const semiHeats = Math.ceil(semifinalists / maxLanes);

        rounds.push({
          type: 'QUALIFICATION',
          seriesCount: qualHeats,
          finalistsCount: semifinalists,
          duration: qualHeats * this.getBaseDuration(event),
        });
        rounds.push({
          type: 'SEMIFINAL',
          seriesCount: semiHeats,
          finalistsCount: 8,
          duration: semiHeats * this.getBaseDuration(event),
        });
        rounds.push({
          type: 'FINAL',
          seriesCount: 1,
          finalistsCount: null,
          duration: this.getBaseDuration(event),
        });
        finalistsCount = 8;
      }
    } else {
      // Wydarzenia techniczne - zazwyczaj tylko finał
      rounds.push({
        type: 'FINAL',
        seriesCount: 1,
        finalistsCount: null,
        duration: this.calculateFieldEventDuration(event, participantsCount),
      });
    }

    return {
      seriesCount: rounds.reduce((sum, round) => sum + round.seriesCount, 0),
      finalistsCount,
      rounds,
    };
  }

  // Oblicz czas trwania wydarzenia
  private calculateEventDuration(
    event: any,
    participantsCount: number,
  ): number {
    if (event.type === EventType.TRACK) {
      return this.calculateTrackEventDuration(event, participantsCount);
    } else if (event.type === EventType.FIELD) {
      return this.calculateFieldEventDuration(event, participantsCount);
    } else {
      return 120; // Wieloboje - 2 godziny jako domyślny czas
    }
  }

  private calculateTrackEventDuration(
    event: any,
    participantsCount: number,
  ): number {
    const baseDuration = this.getBaseDuration(event);
    const heatsCount = Math.ceil(participantsCount / 8);
    return heatsCount * baseDuration + (heatsCount - 1) * 5; // 5 minut przerwy między biegami
  }

  private calculateFieldEventDuration(
    event: any,
    participantsCount: number,
  ): number {
    // Wydarzenia techniczne - około 3-4 minuty na zawodnika
    const timePerAthlete = 3.5;
    return Math.max(30, participantsCount * timePerAthlete);
  }

  private getBaseDuration(event: { distance?: string; name?: string }): number {
    // Bazowy czas dla różnych typów biegów
    const distance =
      event.distance?.toLowerCase() || event.name?.toLowerCase() || '';

    if (distance.includes('100m') || distance.includes('60m')) return 10;
    if (distance.includes('200m')) return 12;
    if (distance.includes('400m')) return 15;
    if (distance.includes('800m')) return 20;
    if (distance.includes('1500m')) return 25;
    if (distance.includes('3000m')) return 35;
    if (distance.includes('5000m')) return 45;
    if (distance.includes('10000m')) return 90;
    if (distance.includes('płotki') || distance.includes('hurdles')) return 15;
    if (distance.includes('sztafeta') || distance.includes('relay')) return 15;

    return 15; // Domyślny czas
  }

  private generateEventNotes(
    event: { distance?: string; name?: string },
    participantsCount: number,
    round: { seriesCount: number; finalistsCount: number | null },
  ): string {
    const notes: string[] = [];

    if (participantsCount > 0) {
      notes.push(`${participantsCount} zawodników`);
    }

    if (round.seriesCount > 1) {
      notes.push(`${round.seriesCount} serii`);
    }

    if (round.finalistsCount) {
      notes.push(`${round.finalistsCount} do finału`);
    }

    return notes.join(', ');
  }

  // Generuj program minutowy w formacie podobnym do Domtel Sport
  async generateMinuteProgram(competitionId: string) {
    const schedule = await this.prisma.competitionSchedule.findFirst({
      where: {
        competitionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            event: true,
          },
          orderBy: {
            scheduledTime: 'asc',
          },
        },
        competition: true,
      },
    });

    if (!schedule) {
      throw new Error('No schedule found for this competition');
    }

    // Grupuj wydarzenia według godziny
    const timeGroups = new Map();

    for (const item of schedule.items) {
      const timeKey = item.scheduledTime.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }

      timeGroups.get(timeKey).push({
        time: timeKey,
        eventName: this.formatEventName(item.event as any),
        round: this.formatRound(item.round),
        series: item.seriesCount > 1 ? `${item.seriesCount} serii` : null,
        finalists: item.finalistsCount
          ? `${item.finalistsCount} do finału`
          : null,
        notes: item.notes,
      });
    }

    return {
      competition: schedule.competition,
      schedule: schedule,
      timeGroups: Array.from(timeGroups.entries()).map(([time, events]) => ({
        time,
        events,
      })),
    };
  }

  private formatEventName(event: {
    distance?: string;
    name?: string;
    gender?: string;
    category?: string;
  }): string {
    const parts: string[] = [];

    // Dystans/nazwa
    if (event.distance) {
      parts.push(event.distance);
    } else if (event.name) {
      parts.push(event.name);
    }

    // Płeć
    parts.push(
      event.gender === 'MALE' ? 'M' : event.gender === 'FEMALE' ? 'K' : 'MIX',
    );

    // Kategoria
    if (event.category && event.category !== 'SENIOR') {
      parts.push(this.formatCategory(event.category));
    }

    return parts.join(' ');
  }

  private formatRound(round: string): string {
    switch (round) {
      case 'QUALIFICATION':
        return 'eliminacje';
      case 'SEMIFINAL':
        return 'półfinał';
      case 'FINAL':
        return 'finał';
      case 'QUALIFICATION_A':
        return 'elim. A';
      case 'QUALIFICATION_B':
        return 'elim. B';
      case 'QUALIFICATION_C':
        return 'elim. C';
      default:
        return round.toLowerCase();
    }
  }

  private formatCategory(category?: string): string {
    if (!category) return '';
    // Konwertuj kategorie na czytelny format
    if (category.startsWith('U')) return category;
    if (category.startsWith('M')) return category; // Masters
    if (category.startsWith('AGE_'))
      return category.replace('AGE_', '') + ' lat';
    return category;
  }
}
