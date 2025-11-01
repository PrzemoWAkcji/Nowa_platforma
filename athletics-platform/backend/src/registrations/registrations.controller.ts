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
  Request,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER', 'COACH', 'ATHLETE')
  create(
    @Body() createRegistrationDto: CreateRegistrationDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.registrationsService.create(createRegistrationDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('competitionId') competitionId?: string,
    @Query('eventId') eventId?: string,
    @Query('athleteId') athleteId?: string,
    @Query('userId') userId?: string,
  ) {
    if (competitionId && eventId) {
      return this.registrationsService.findByCompetitionAndEvent(
        competitionId,
        eventId,
      );
    }

    if (competitionId) {
      return this.registrationsService.findByCompetition(competitionId);
    }

    if (athleteId) {
      return this.registrationsService.findByAthlete(athleteId);
    }

    if (userId) {
      return this.registrationsService.findByUser(userId);
    }

    return this.registrationsService.findAll();
  }

  @Get('my-registrations')
  findMyRegistrations(@Request() req: { user: { id: string } }) {
    return this.registrationsService.findByUser(req.user.id);
  }

  @Get('statistics')
  @Public()
  getStatistics(@Query('competitionId') competitionId?: string) {
    return this.registrationsService.getRegistrationStatistics(competitionId);
  }

  @Get('start-list/:competitionId/:eventId')
  @Public()
  getStartListSortedByRecords(
    @Param('competitionId') competitionId: string,
    @Param('eventId') eventId: string,
    @Query('sortBy') sortBy: 'PB' | 'SB' | 'SEED_TIME' = 'PB',
  ) {
    return this.registrationsService.getStartListSortedByRecords(
      competitionId,
      eventId,
      sortBy,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.update(id, updateRegistrationDto);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.registrationsService.confirmRegistration(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.registrationsService.cancelRegistration(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.registrationsService.rejectRegistration(id);
  }

  @Post('assign-bib-numbers/:competitionId')
  assignBibNumbers(
    @Param('competitionId') competitionId: string,
    @Body() body: { startingNumber?: number }
  ) {
    return this.registrationsService.assignBibNumbers(
      competitionId, 
      body.startingNumber || 1
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
