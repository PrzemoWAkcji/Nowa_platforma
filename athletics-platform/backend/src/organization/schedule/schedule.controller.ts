import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleGeneratorService } from './schedule-generator.service';
import {
  CreateScheduleDto,
  ScheduleGeneratorOptions,
} from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ScheduleStatus } from '@prisma/client';

@Controller('organization/schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly scheduleGeneratorService: ScheduleGeneratorService,
  ) {}

  @Post()
  @Roles('ADMIN', 'COACH')
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll(@Query('competitionId') competitionId?: string) {
    return this.scheduleService.findAll(competitionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'COACH')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'COACH')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }

  @Post(':id/publish')
  @Roles('ADMIN', 'COACH')
  publish(@Param('id') id: string) {
    return this.scheduleService.publish(id);
  }

  @Post(':id/unpublish')
  @Roles('ADMIN', 'COACH')
  unpublish(@Param('id') id: string) {
    return this.scheduleService.unpublish(id);
  }

  @Patch(':scheduleId/items/:itemId/status')
  @Roles('ADMIN', 'COACH', 'JUDGE')
  updateItemStatus(
    @Param('scheduleId') scheduleId: string,
    @Param('itemId') itemId: string,
    @Body('status') status: ScheduleStatus,
  ) {
    return this.scheduleService.updateItemStatus(scheduleId, itemId, status);
  }

  @Get('events/:eventId/participants')
  getEventParticipants(@Param('eventId') eventId: string) {
    return this.scheduleService.getEventParticipants(eventId);
  }

  @Post('generate')
  @Roles('ADMIN', 'COACH')
  generateSchedule(@Body() options: ScheduleGeneratorOptions) {
    return this.scheduleGeneratorService.generateSchedule(options as any);
  }

  @Get('competitions/:competitionId/minute-program')
  getMinuteProgram(@Param('competitionId') competitionId: string) {
    return this.scheduleGeneratorService.generateMinuteProgram(competitionId);
  }
}
