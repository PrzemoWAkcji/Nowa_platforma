import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { EventRound, ScheduleStatus } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { competitionId, name, description, isPublished, items } =
      createScheduleDto;

    // Sprawdź czy zawody istnieją
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Competition not found');
    }

    // Sprawdź czy wszystkie wydarzenia istnieją
    const eventIds = items.map((item) => item.eventId);
    const events = await this.prisma.event.findMany({
      where: {
        id: { in: eventIds },
        competitionId: competitionId,
      },
    });

    if (events.length !== eventIds.length) {
      throw new BadRequestException(
        'Some events do not exist or do not belong to this competition',
      );
    }

    // Utwórz program minutowy z pozycjami
    const schedule = await this.prisma.competitionSchedule.create({
      data: {
        competitionId,
        name,
        description,
        isPublished: isPublished || false,
        items: {
          create: items.map((item) => ({
            eventId: item.eventId,
            scheduledTime: new Date(item.scheduledTime),
            actualTime: item.actualTime ? new Date(item.actualTime) : null,
            duration: item.duration,
            round: item.round as EventRound,
            seriesCount: item.seriesCount || 1,
            finalistsCount: item.finalistsCount,
            notes: item.notes,
            status: ScheduleStatus.SCHEDULED,
          })),
        },
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

    return schedule;
  }

  async findAll(competitionId?: string) {
    const where = competitionId ? { competitionId } : {};

    return this.prisma.competitionSchedule.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.competitionSchedule.findUnique({
      where: { id },
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
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    await this.findOne(id);

    const { items, ...scheduleData } = updateScheduleDto;

    // Aktualizuj podstawowe dane programu
    await this.prisma.competitionSchedule.update({
      where: { id },
      data: scheduleData,
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

    // Jeśli przekazano nowe pozycje, zaktualizuj je
    if (items) {
      // Usuń stare pozycje
      await this.prisma.scheduleItem.deleteMany({
        where: { scheduleId: id },
      });

      // Dodaj nowe pozycje
      await this.prisma.scheduleItem.createMany({
        data: items.map((item) => ({
          scheduleId: id,
          eventId: item.eventId,
          scheduledTime: new Date(item.scheduledTime),
          actualTime: item.actualTime ? new Date(item.actualTime) : null,
          duration: item.duration,
          round: item.round as EventRound,
          seriesCount: item.seriesCount || 1,
          finalistsCount: item.finalistsCount,
          notes: item.notes,
          status: ScheduleStatus.SCHEDULED,
        })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.competitionSchedule.delete({
      where: { id },
    });

    return { message: 'Schedule deleted successfully' };
  }

  async publish(id: string) {
    await this.findOne(id);

    return this.prisma.competitionSchedule.update({
      where: { id },
      data: { isPublished: true },
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
  }

  async unpublish(id: string) {
    await this.findOne(id);

    return this.prisma.competitionSchedule.update({
      where: { id },
      data: { isPublished: false },
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
  }

  async updateItemStatus(
    scheduleId: string,
    itemId: string,
    status: ScheduleStatus,
  ) {
    const item = await this.prisma.scheduleItem.findFirst({
      where: {
        id: itemId,
        scheduleId: scheduleId,
      },
    });

    if (!item) {
      throw new NotFoundException('Schedule item not found');
    }

    return this.prisma.scheduleItem.update({
      where: { id: itemId },
      data: {
        status,
        actualTime:
          status === ScheduleStatus.IN_PROGRESS ? new Date() : item.actualTime,
      },
      include: {
        event: true,
      },
    });
  }

  // Sprawdź przypisanych zawodników do danej konkurencji
  async getEventParticipants(eventId: string) {
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

    return {
      event,
      participants: event.registrationEvents.map((re) => ({
        registration: re.registration,
        athlete: re.registration.athlete,
        seedTime: re.seedTime,
      })),
      totalParticipants: event.registrationEvents.length,
    };
  }
}
