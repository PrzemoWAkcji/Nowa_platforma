import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query
} from '@nestjs/common';
import { RelayTeamsService } from './relay-teams.service';
import { CreateRelayTeamDto, UpdateRelayTeamDto, AddRelayTeamMemberDto, CreateRelayTeamRegistrationDto, CreateRelayTeamResultDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('relay-teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RelayTeamsController {
  constructor(private readonly relayTeamsService: RelayTeamsService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER', 'COACH')
  create(@Body() createRelayTeamDto: CreateRelayTeamDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.relayTeamsService.create(createRelayTeamDto, userId);
  }

  @Get('competition/:competitionId')
  @Public()
  findByCompetition(@Param('competitionId') competitionId: string) {
    return this.relayTeamsService.findByCompetition(competitionId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.relayTeamsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRelayTeamDto: UpdateRelayTeamDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.relayTeamsService.update(id, updateRelayTeamDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.relayTeamsService.remove(id, userId);
  }

  @Post(':id/members')
  addMember(@Param('id') teamId: string, @Body() addMemberDto: AddRelayTeamMemberDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.relayTeamsService.addMember(teamId, addMemberDto, userId);
  }

  @Delete(':teamId/members/:memberId')
  removeMember(@Param('teamId') teamId: string, @Param('memberId') memberId: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.relayTeamsService.removeMember(teamId, memberId, userId);
  }

  // DEBUG: Sprawdź członków zespołu
  @Get(':teamId/debug-members')
  debugMembers(@Param('teamId') teamId: string) {
    return this.relayTeamsService.debugMembers(teamId);
  }

  // NAPRAW: Usuń nadmiarowych członków zespołu
  @Post(':teamId/fix-members')
  fixMembers(@Param('teamId') teamId: string) {
    return this.relayTeamsService.fixTeamMembers(teamId);
  }

  @Post('registrations')
  registerForEvent(@Body() registrationDto: CreateRelayTeamRegistrationDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.relayTeamsService.registerForEvent(registrationDto, userId);
  }

  @Get('events/:eventId/registrations')
  getEventRegistrations(@Param('eventId') eventId: string) {
    return this.relayTeamsService.getEventRegistrations(eventId);
  }

  @Post('results')
  addResult(@Body() resultDto: CreateRelayTeamResultDto) {
    return this.relayTeamsService.addResult(resultDto);
  }

  @Get('events/:eventId/results')
  getEventResults(@Param('eventId') eventId: string) {
    return this.relayTeamsService.getEventResults(eventId);
  }
}