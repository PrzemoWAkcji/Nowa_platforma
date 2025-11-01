import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  create(@Body() createEventDto: CreateEventDto) {
    this.logger.debug(`Creating event: ${createEventDto.name}`);
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('competitionId') competitionId?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    if (competitionId) {
      return this.eventsService.findByCompetition(competitionId);
    }

    if (type) {
      return this.eventsService.findByType(type);
    }

    if (category) {
      return this.eventsService.findByCategory(category);
    }

    return this.eventsService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/statistics')
  @Public()
  getStatistics(@Param('id') id: string) {
    return this.eventsService.getEventStatistics(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/complete')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  markAsCompleted(@Param('id') id: string) {
    return this.eventsService.markAsCompleted(id);
  }

  @Post(':id/ongoing')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  markAsOngoing(@Param('id') id: string) {
    return this.eventsService.markAsOngoing(id);
  }
}
