import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Event } from '@prisma/client';
import { EquipmentService } from '../equipment/equipment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private equipmentService: EquipmentService,
  ) {}

  /**
   * Helper function to format scheduledTime to proper ISO-8601 DateTime
   */
  private formatScheduledTime(scheduledTime: string): Date {
    // If the scheduledTime doesn't include seconds, add them
    let timeString = scheduledTime;
    if (timeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      timeString += ':00';
    }

    const formattedDate = new Date(timeString);

    // Validate that the date is valid
    if (isNaN(formattedDate.getTime())) {
      throw new Error(
        `Invalid scheduledTime format: ${scheduledTime}. Expected ISO-8601 DateTime format.`,
      );
    }

    return formattedDate;
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    this.logger.debug(
      `Creating event: ${createEventDto.name} for competition: ${createEventDto.competitionId}`,
    );

    // Verify competition exists
    const competition = await this.prisma.competition.findUnique({
      where: { id: createEventDto.competitionId },
    });

    if (!competition) {
      this.logger.error(
        `Competition not found: ${createEventDto.competitionId}`,
      );
      throw new NotFoundException('Competition not found');
    }

    this.logger.debug(`Competition found: ${competition.name}`);

    // Automatycznie pobierz specyfikacje sprzętu dla danej kategorii i dyscypliny
    const equipmentSpecs = this.equipmentService.getEquipmentSpecs(
      createEventDto.category,
      createEventDto.discipline || createEventDto.name,
      createEventDto.gender as 'MALE' | 'FEMALE',
    );

    this.logger.debug(
      `Equipment specs retrieved for event: ${createEventDto.name}`,
    );

    // Format scheduledTime to proper ISO-8601 DateTime if provided
    let formattedScheduledTime: Date | undefined;
    if (createEventDto.scheduledTime) {
      formattedScheduledTime = this.formatScheduledTime(
        createEventDto.scheduledTime,
      );
    }

    const eventData = {
      ...createEventDto,
      scheduledTime: formattedScheduledTime,
      seedTimeRequired: createEventDto.seedTimeRequired || false,
      hurdleHeight: equipmentSpecs.hurdleHeight,
      implementWeight: equipmentSpecs.implementWeight,
      implementSpecs: equipmentSpecs.implementSpecs,
    };

    try {
      const result = await this.prisma.event.create({
        data: eventData,
        include: {
          competition: {
            select: {
              id: true,
              name: true,
              startDate: true,
              location: true,
            },
          },
        },
      });
      this.logger.log(
        `Event created successfully: ${result.id} - ${result.name}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error creating event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.event.findMany({
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true,
          },
        },
        _count: {
          select: {
            registrationEvents: true,
            results: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByCompetition(competitionId: string) {
    return this.prisma.event.findMany({
      where: { competitionId },
      include: {
        _count: {
          select: {
            registrationEvents: true,
            results: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByType(type: string) {
    // Validate that the type is a valid enum value
    const validTypes = ['TRACK', 'FIELD', 'ROAD', 'COMBINED', 'RELAY'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid event type value: ${type}`);
    }

    return this.prisma.event.findMany({
      where: { type: type as any },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByCategory(category: string) {
    // Validate that the category is a valid enum value
    const validCategories = this.equipmentService.getAllCategories();
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category value: ${category}`);
    }

    return this.prisma.event.findMany({
      where: { category: category as any },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        competition: true,
        registrationEvents: {
          include: {
            registration: {
              include: {
                athlete: true,
              },
            },
          },
        },
        results: {
          include: {
            athlete: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Format scheduledTime to proper ISO-8601 DateTime if provided
    const updateData = { ...updateEventDto };
    if (updateEventDto.scheduledTime) {
      updateData.scheduledTime = this.formatScheduledTime(
        updateEventDto.scheduledTime,
      ) as any;
    }

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }

  async getEventStatistics(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
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
        results: {
          include: {
            athlete: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const totalRegistrations = event.registrationEvents.length;
    const totalResults = event.results.length;
    const completionRate =
      totalRegistrations > 0 ? (totalResults / totalRegistrations) * 100 : 0;

    const genderDistribution = event.registrationEvents.reduce(
      (acc, regEvent) => {
        const gender = regEvent.registration.athlete.gender;
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const categoryDistribution = event.registrationEvents.reduce(
      (acc, regEvent) => {
        const category = regEvent.registration.athlete.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      event,
      statistics: {
        totalRegistrations,
        totalResults,
        completionRate: Math.round(completionRate * 100) / 100,
        genderDistribution,
        categoryDistribution,
        maxParticipants: event.maxParticipants,
        spotsRemaining: event.maxParticipants
          ? event.maxParticipants - totalRegistrations
          : null,
      },
    };
  }

  /**
   * Oznacza konkurencję jako zakończoną
   */
  async markAsCompleted(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data: { isCompleted: true },
    });
  }

  /**
   * Oznacza konkurencję jako w trakcie
   */
  async markAsOngoing(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data: { isCompleted: false },
    });
  }
}
