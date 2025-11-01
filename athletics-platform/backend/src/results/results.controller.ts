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
import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultsService.create(createResultDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('eventId') eventId?: string,
    @Query('athleteId') athleteId?: string,
    @Query('competitionId') competitionId?: string,
    @Query('personalBests') personalBests?: string,
    @Query('records') records?: string,
  ) {
    if (records === 'true') {
      return this.resultsService.findRecords();
    }

    if (personalBests === 'true' && athleteId) {
      return this.resultsService.findPersonalBests(athleteId);
    }

    if (eventId) {
      return this.resultsService.findByEvent(eventId);
    }

    if (athleteId) {
      return this.resultsService.findByAthlete(athleteId);
    }

    if (competitionId) {
      return this.resultsService.findByCompetition(competitionId);
    }

    return this.resultsService.findAll();
  }

  @Get('events/:eventId/results')
  @Public()
  getEventResults(@Param('eventId') eventId: string) {
    return this.resultsService.getEventResults(eventId);
  }

  @Get('athletes/:athleteId/events/:eventName')
  @Public()
  getAthleteResultsInEvent(
    @Param('athleteId') athleteId: string,
    @Param('eventName') eventName: string,
  ) {
    return this.resultsService.getAthleteResultsInEvent(athleteId, eventName);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.resultsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  update(@Param('id') id: string, @Body() updateResultDto: UpdateResultDto) {
    return this.resultsService.update(id, updateResultDto);
  }

  @Patch('events/:eventId/calculate-positions')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  calculatePositions(@Param('eventId') eventId: string) {
    return this.resultsService.calculatePositions(eventId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  remove(@Param('id') id: string) {
    return this.resultsService.remove(id);
  }
}
