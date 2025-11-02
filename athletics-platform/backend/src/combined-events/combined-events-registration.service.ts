import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Category,
  EventType,
  Gender,
  Unit,
} from '../events/dto/create-event.dto';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { CombinedEventsService } from './combined-events.service';
import { GenerateIndividualEventsDto } from './dto/generate-individual-events.dto';
import { CombinedEventType } from './types/combined-events.types';

export interface RegisterAthleteForCombinedEventDto {
  athleteId: string;
  competitionId: string;
  eventType: CombinedEventType;
  gender: 'MALE' | 'FEMALE';
  createSeparateEvents?: boolean; // Opcja rozdzielenia na osobne konkurencje
}

export interface SplitCombinedEventDto {
  combinedEventId: string;
  createRegistrations?: boolean; // Czy utworzyć rejestracje na poszczególne konkurencje
}

@Injectable()
export class CombinedEventsRegistrationService {
  constructor(
    private prisma: PrismaService,
    private combinedEventsService: CombinedEventsService,
    private eventsService: EventsService,
    private registrationsService: RegistrationsService,
  ) {}

  /**
   * Rejestruje zawodnika na wielobój - uproszczona metoda
   */
  async registerAthleteForCombinedEvent(
    dto: RegisterAthleteForCombinedEventDto,
  ) {
    // Sprawdź czy zawodnik istnieje
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: dto.athleteId },
    });

    if (!athlete) {
      throw new NotFoundException('Zawodnik nie został znaleziony');
    }

    // Sprawdź czy zawody istnieją
    const competition = await this.prisma.competition.findUnique({
      where: { id: dto.competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Zawody nie zostały znalezione');
    }

    // Sprawdź czy zawodnik nie jest już zarejestrowany na ten wielobój
    const existingCombinedEvent = await this.prisma.combinedEvent.findFirst({
      where: {
        athleteId: dto.athleteId,
        competitionId: dto.competitionId,
        eventType: dto.eventType,
      },
    });

    if (existingCombinedEvent) {
      throw new BadRequestException(
        'Zawodnik jest już zarejestrowany na ten wielobój',
      );
    }

    // Utwórz wielobój
    const combinedEvent = await this.combinedEventsService.createCombinedEvent({
      athleteId: dto.athleteId,
      competitionId: dto.competitionId,
      eventType: dto.eventType,
      gender: dto.gender,
    });

    // Opcjonalnie utwórz osobne konkurencje
    if (dto.createSeparateEvents) {
      await this.createSeparateEventsForCombinedEvent(combinedEvent.id);
    }

    return combinedEvent;
  }

  /**
   * Rozdziela istniejący wielobój na osobne konkurencje
   */
  async splitCombinedEventIntoSeparateEvents(dto: SplitCombinedEventDto) {
    const combinedEvent = await this.prisma.combinedEvent.findUnique({
      where: { id: dto.combinedEventId },
      include: {
        athlete: true,
        competition: true,
        results: true,
      },
    });

    if (!combinedEvent) {
      throw new NotFoundException('Wielobój nie został znaleziony');
    }

    const disciplines = this.combinedEventsService.getDisciplinesForEvent(
      combinedEvent.eventType as CombinedEventType,
      combinedEvent.gender as 'MALE' | 'FEMALE',
    );

    const createdEvents: any[] = [];
    const createdRegistrations: any[] = [];

    for (const discipline of disciplines) {
      // Utwórz konkurencję dla każdej dyscypliny
      const eventName = this.getDisciplineEventName(
        discipline,
        combinedEvent.eventType as any,
      );
      const eventType = this.getDisciplineEventType(discipline);

      const event = await this.eventsService.create({
        name: eventName,
        type: eventType,
        gender: combinedEvent.gender as Gender,
        category: combinedEvent.athlete.category as Category,
        unit: this.getDisciplineUnit(discipline),
        competitionId: combinedEvent.competitionId,
        distance: this.getDisciplineDistance(discipline),
        discipline: this.getDisciplineName(discipline),
      });

      createdEvents.push(event);

      // Opcjonalnie utwórz rejestrację
      if (dto.createRegistrations) {
        // Znajdź użytkownika (może być trener lub sam zawodnik)
        const user = await this.prisma.user.findFirst({
          where: {
            OR: [
              { id: combinedEvent.athlete.coachId || '' },
              {
                email: `${combinedEvent.athlete.firstName.toLowerCase()}.${combinedEvent.athlete.lastName.toLowerCase()}@athletics.pl`,
              },
            ],
          },
        });

        if (user) {
          const registration = await this.registrationsService.create(
            {
              athleteId: combinedEvent.athleteId,
              competitionId: combinedEvent.competitionId,
              eventIds: [event.id],
              notes: `Automatycznie utworzone z wieloboju ${combinedEvent.eventType}`,
            },
            user.id,
          );

          createdRegistrations.push(registration);
        }
      }
    }

    return {
      combinedEvent,
      createdEvents,
      createdRegistrations,
      message: `Utworzono ${createdEvents.length} konkurencji z wieloboju ${combinedEvent.eventType}`,
    };
  }

  /**
   * Tworzy osobne konkurencje dla istniejącego wieloboju
   */
  private async createSeparateEventsForCombinedEvent(combinedEventId: string) {
    return this.splitCombinedEventIntoSeparateEvents({
      combinedEventId,
      createRegistrations: true,
    });
  }

  /**
   * Pobiera wszystkich zawodników zarejestrowanych na wieloboje w zawodach
   */
  async getCombinedEventRegistrations(competitionId: string) {
    const combinedEvents = await this.prisma.combinedEvent.findMany({
      where: { competitionId },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            club: true,
            category: true,
            gender: true,
          },
        },
        results: true,
      },
      orderBy: [{ eventType: 'asc' }, { athlete: { lastName: 'asc' } }],
    });

    return combinedEvents.map((ce) => ({
      id: ce.id,
      eventType: ce.eventType,
      athlete: ce.athlete,
      totalPoints: ce.totalPoints,
      isComplete: ce.isComplete,
      resultsCount: ce.results.length,
      completedDisciplines: ce.results.filter((r) => r.isValid).length,
      totalDisciplines: ce.results.length,
    }));
  }

  /**
   * Masowa rejestracja zawodników na wielobój
   */
  async bulkRegisterAthletesForCombinedEvent(dto: {
    athleteIds: string[];
    competitionId: string;
    eventType: CombinedEventType;
    gender: 'MALE' | 'FEMALE';
    createSeparateEvents?: boolean;
  }) {
    const results: any[] = [];
    const errors: any[] = [];

    for (const athleteId of dto.athleteIds) {
      try {
        const result = await this.registerAthleteForCombinedEvent({
          athleteId,
          competitionId: dto.competitionId,
          eventType: dto.eventType,
          gender: dto.gender,
          createSeparateEvents: dto.createSeparateEvents,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          athleteId,
          error: error.message,
        });
      }
    }

    return {
      successful: results,
      errors,
      summary: {
        total: dto.athleteIds.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  // Helper methods for event creation
  private getDisciplineEventName(discipline: string, eventType: any): string {
    const disciplineNames = {
      '100M': '100m',
      '200M': '200m',
      '400M': '400m',
      '800M': '800m',
      '1000M': '1000m',
      '1500M': '1500m',
      '110H': '110m ppł',
      '100H': '100m ppł',
      '80H': '80m ppł',
      '60H': '60m ppł',
      HJ: 'Skok wzwyż',
      LJ: 'Skok w dal',
      PV: 'Skok o tyczce',
      SP: 'Pchnięcie kulą',
      DT: 'Rzut dyskiem',
      JT: 'Rzut oszczepem',
      HT: 'Rzut młotem',
    };

    const baseName = disciplineNames[discipline] || discipline;
    return `${baseName} (${eventType})`;
  }

  private getDisciplineEventType(discipline: string): EventType {
    if (
      [
        '100M',
        '200M',
        '400M',
        '800M',
        '1000M',
        '1500M',
        '110H',
        '100H',
        '80H',
        '60H',
      ].includes(discipline)
    ) {
      return EventType.TRACK;
    }
    return EventType.FIELD;
  }

  private getDisciplineUnit(discipline: string): Unit {
    if (
      [
        '100M',
        '200M',
        '400M',
        '800M',
        '1000M',
        '1500M',
        '110H',
        '100H',
        '80H',
        '60H',
      ].includes(discipline)
    ) {
      return Unit.TIME;
    }
    if (['HJ', 'PV'].includes(discipline)) {
      return Unit.HEIGHT;
    }
    return Unit.DISTANCE;
  }

  private getDisciplineDistance(discipline: string): string | undefined {
    const distances = {
      '100M': '100m',
      '200M': '200m',
      '400M': '400m',
      '800M': '800m',
      '1000M': '1000m',
      '1500M': '1500m',
      '110H': '110m',
      '100H': '100m',
      '80H': '80m',
      '60H': '60m',
    };
    return distances[discipline] || undefined;
  }

  private getDisciplineName(discipline: string): string {
    const names = {
      '100M': 'sprint',
      '200M': 'sprint',
      '400M': 'sprint',
      '800M': 'distance',
      '1000M': 'distance',
      '1500M': 'distance',
      '110H': 'hurdles',
      '100H': 'hurdles',
      '80H': 'hurdles',
      '60H': 'hurdles',
      HJ: 'jump',
      LJ: 'jump',
      PV: 'jump',
      SP: 'throw',
      DT: 'throw',
      JT: 'throw',
      HT: 'throw',
    };
    return names[discipline] || 'combined';
  }

  private getHurdleHeight(
    discipline: string,
    category: any,
  ): string | undefined {
    if (!['110H', '100H', '80H', '60H'].includes(discipline)) return undefined;

    // Przykładowe wysokości - należy dostosować do rzeczywistych przepisów
    const heights = {
      '110H': '1.067m', // Senior mężczyźni
      '100H': '0.84m', // Senior kobiety
      '80H': '0.76m', // U16 dziewczęta
      '60H': '0.84m', // Hala
    };

    return heights[discipline] || undefined;
  }

  private getImplementWeight(
    discipline: string,
    category: any,
  ): string | undefined {
    if (!['SP', 'DT', 'JT', 'HT'].includes(discipline)) return undefined;

    // Przykładowe wagi - należy dostosować do rzeczywistych przepisów
    const weights = {
      SP: '7.26kg', // Senior mężczyźni, dla kobiet 4kg, U16 różnie
      DT: '2kg', // Senior mężczyźni, dla kobiet 1kg
      JT: '800g', // Senior mężczyźni, dla kobiet 600g
      HT: '7.26kg', // Senior mężczyźni, dla kobiet 4kg
    };

    return weights[discipline] || undefined;
  }

  /**
   * Generuje konkurencje składowe wieloboju na podstawie list startowych
   * Główna metoda do automatycznego tworzenia konkurencji z wielobojów
   */
  async generateIndividualEventsFromCombinedEvents(
    dto: GenerateIndividualEventsDto,
  ) {
    const {
      competitionId,
      combinedEventIds,
      createRegistrations = true,
      overwriteExisting = false,
    } = dto;

    // Sprawdź czy zawody istnieją
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Zawody nie zostały znalezione');
    }

    // Pobierz konkurencje wielobojowe (Events z type COMBINED)
    const combinedEvents = await this.prisma.event.findMany({
      where: {
        id: { in: combinedEventIds },
        competitionId,
        type: 'COMBINED',
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
    });

    if (combinedEvents.length === 0) {
      throw new NotFoundException('Nie znaleziono konkurencji wielobojowych');
    }

    const results = {
      processedEvents: [] as any[],
      createdEvents: [] as any[],
      createdRegistrations: [] as any[],
      errors: [] as any[],
      summary: {
        totalCombinedEvents: combinedEvents.length,
        totalAthletes: 0,
        totalCreatedEvents: 0,
        totalCreatedRegistrations: 0,
      },
    };

    for (const combinedEvent of combinedEvents) {
      try {
        // Określ typ wieloboju na podstawie nazwy konkurencji
        const eventType = this.determineCombinedEventType(
          combinedEvent.name,
          combinedEvent.gender,
        );

        if (!eventType) {
          results.errors.push({
            eventId: combinedEvent.id,
            eventName: combinedEvent.name,
            error: 'Nie można określić typu wieloboju na podstawie nazwy',
          });
          continue;
        }

        // Pobierz dyscypliny dla tego typu wieloboju
        const disciplines = this.combinedEventsService.getDisciplinesForEvent(
          eventType,
          combinedEvent.gender as 'MALE' | 'FEMALE',
        );

        // Pobierz zawodników zarejestrowanych na tę konkurencję wielobojową
        const registeredAthletes = combinedEvent.registrationEvents.map(
          (re) => re.registration,
        );

        if (registeredAthletes.length === 0) {
          results.errors.push({
            eventId: combinedEvent.id,
            eventName: combinedEvent.name,
            error: 'Brak zarejestrowanych zawodników',
          });
          continue;
        }

        results.summary.totalAthletes += registeredAthletes.length;

        const eventResults = {
          combinedEventId: combinedEvent.id,
          combinedEventName: combinedEvent.name,
          athletesCount: registeredAthletes.length,
          createdEvents: [] as any[],
          createdRegistrations: [] as any[],
        };

        // Utwórz konkurencję dla każdej dyscypliny
        for (const discipline of disciplines) {
          const eventName = this.getDisciplineEventName(discipline, eventType);
          const eventType_field = this.getDisciplineEventType(discipline);

          // Sprawdź czy konkurencja już istnieje
          const existingEvent = await this.prisma.event.findFirst({
            where: {
              competitionId,
              name: eventName,
              gender: combinedEvent.gender,
              category: combinedEvent.category,
            },
          });

          let event;
          if (existingEvent && !overwriteExisting) {
            // Użyj istniejącej konkurencji
            event = existingEvent;
          } else {
            // Utwórz nową konkurencję lub nadpisz istniejącą
            const eventData = {
              name: eventName,
              type: eventType_field,
              gender: combinedEvent.gender as Gender,
              category: combinedEvent.category as Category,
              unit: this.getDisciplineUnit(discipline),
              competitionId,
              distance: this.getDisciplineDistance(discipline),
              discipline: this.getDisciplineName(discipline),
              hurdleHeight: this.getHurdleHeight(
                discipline,
                combinedEvent.category,
              ),
              implementWeight: this.getImplementWeight(
                discipline,
                combinedEvent.category,
              ),
            };

            if (existingEvent && overwriteExisting) {
              // Aktualizuj istniejącą konkurencję
              event = await this.prisma.event.update({
                where: { id: existingEvent.id },
                data: eventData,
              });
            } else {
              // Utwórz nową konkurencję
              event = await this.eventsService.create(eventData);
            }

            eventResults.createdEvents.push(event);
            results.createdEvents.push(event);
            results.summary.totalCreatedEvents++;
          }

          // Utwórz rejestracje dla wszystkich zawodników z wieloboju
          if (createRegistrations) {
            for (const registration of registeredAthletes) {
              try {
                // Sprawdź czy zawodnik nie jest już zarejestrowany na tę konkurencję
                const existingRegistration =
                  await this.prisma.registrationEvent.findFirst({
                    where: {
                      registration: {
                        athleteId: registration.athleteId,
                        competitionId,
                      },
                      eventId: event.id,
                    },
                  });

                if (!existingRegistration) {
                  // Utwórz nową rejestrację na konkurencję
                  const newRegistrationEvent =
                    await this.prisma.registrationEvent.create({
                      data: {
                        registrationId: registration.id,
                        eventId: event.id,
                        seedTime: null, // Brak czasu zgłoszeniowego dla konkurencji z wieloboju
                      },
                    });

                  eventResults.createdRegistrations.push({
                    athlete: registration.athlete,
                    event: event,
                    registrationEvent: newRegistrationEvent,
                  });
                  results.createdRegistrations.push(newRegistrationEvent);
                  results.summary.totalCreatedRegistrations++;
                }
              } catch (regError) {
                results.errors.push({
                  eventId: combinedEvent.id,
                  athleteId: registration.athleteId,
                  athleteName: `${registration.athlete.firstName} ${registration.athlete.lastName}`,
                  eventName: event.name,
                  error: `Błąd podczas tworzenia rejestracji: ${regError.message}`,
                });
              }
            }
          }
        }

        results.processedEvents.push(eventResults);
      } catch (error) {
        results.errors.push({
          eventId: combinedEvent.id,
          eventName: combinedEvent.name,
          error: `Błąd podczas przetwarzania: ${error.message}`,
        });
      }
    }

    return {
      ...results,
      message: `Przetworzono ${results.processedEvents.length} wielobojów. Utworzono ${results.summary.totalCreatedEvents} konkurencji i ${results.summary.totalCreatedRegistrations} rejestracji.`,
    };
  }

  /**
   * Określa typ wieloboju na podstawie nazwy konkurencji
   */
  private determineCombinedEventType(
    eventName: string,
    gender: string,
  ): CombinedEventType | null {
    const name = eventName.toLowerCase();

    // Pięcioboje
    if (name.includes('pięciobój') || name.includes('pentathlon')) {
      if (name.includes('u16') || name.includes('16')) {
        return gender === 'MALE'
          ? CombinedEventType.PENTATHLON_U16_MALE
          : CombinedEventType.PENTATHLON_U16_FEMALE;
      }
      if (name.includes('indoor') || name.includes('hala')) {
        return CombinedEventType.PENTATHLON_INDOOR;
      }
      return CombinedEventType.PENTATHLON_OUTDOOR;
    }

    // Siedmiobój
    if (name.includes('siedmiobój') || name.includes('heptathlon')) {
      return CombinedEventType.HEPTATHLON;
    }

    // Dziesięciobój
    if (name.includes('dziesięciobój') || name.includes('decathlon')) {
      return CombinedEventType.DECATHLON;
    }

    return null;
  }

  /**
   * Pobiera wszystkie konkurencje wielobojowe w zawodach (Events z type COMBINED)
   */
  async getCombinedEventsForGeneration(competitionId: string) {
    const combinedEvents = await this.prisma.event.findMany({
      where: {
        competitionId,
        type: 'COMBINED',
      },
      include: {
        registrationEvents: {
          include: {
            registration: {
              include: {
                athlete: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    gender: true,
                    category: true,
                    club: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            registrationEvents: true,
          },
        },
      },
      orderBy: [{ gender: 'asc' }, { name: 'asc' }],
    });

    return combinedEvents.map((event) => ({
      id: event.id,
      name: event.name,
      gender: event.gender,
      category: event.category,
      athletesCount: event._count.registrationEvents,
      athletes: event.registrationEvents.map((re) => ({
        id: re.registration.athlete.id,
        firstName: re.registration.athlete.firstName,
        lastName: re.registration.athlete.lastName,
        gender: re.registration.athlete.gender,
        category: re.registration.athlete.category,
        club: re.registration.athlete.club,
      })),
      canGenerate: event._count.registrationEvents > 0,
      estimatedEventType: this.determineCombinedEventType(
        event.name,
        event.gender,
      ),
    }));
  }
}
