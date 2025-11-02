import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AthletesService } from './athletes.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';

@Controller('athletes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER', 'COACH')
  create(@Body() createAthleteDto: CreateAthleteDto) {
    return this.athletesService.create(createAthleteDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('category') category?: string,
    @Query('gender') gender?: string,
    @Query('paraAthletes') paraAthletes?: string,
  ) {
    if (paraAthletes === 'true') {
      return this.athletesService.findParaAthletes();
    }

    if (category) {
      return this.athletesService.findByCategory(category);
    }

    if (gender) {
      return this.athletesService.findByGender(gender);
    }

    return this.athletesService.findAll();
  }

  @Get('coach/:coachId')
  findByCoach(@Param('coachId') coachId: string) {
    return this.athletesService.findByCoach(coachId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.athletesService.findOne(id);
  }

  @Get(':id/stats')
  @Public()
  getStats(@Param('id') id: string) {
    return this.athletesService.getAthleteStats(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER', 'COACH')
  update(@Param('id') id: string, @Body() updateAthleteDto: UpdateAthleteDto) {
    return this.athletesService.update(id, updateAthleteDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  remove(@Param('id') id: string) {
    return this.athletesService.remove(id);
  }

  @Post('import-csv')
  @Roles('ADMIN', 'ORGANIZER')
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('format') format: 'pzla' | 'international' | 'auto' = 'auto',
    @Body('updateExisting') updateExisting: boolean = false,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.athletesService.importFromCsv(
      file.buffer,
      format,
      updateExisting,
    );
  }

  // ===== PERSONAL BESTS & SEASON BESTS ENDPOINTS =====

  @Get(':id/records')
  getAthleteRecords(
    @Param('id') id: string,
    @Query('event') eventName?: string,
  ) {
    return this.athletesService.getAthleteRecords(id, eventName);
  }

  @Get('rankings/:eventName')
  getAthleteRankings(
    @Param('eventName') eventName: string,
    @Query('sortBy') sortBy: 'PB' | 'SB' = 'PB',
    @Query('gender') gender?: 'MALE' | 'FEMALE',
    @Query('category') category?: string,
    @Query('limit') limit: string = '50',
  ) {
    return this.athletesService.getAthletesSortedByRecords(
      eventName,
      sortBy,
      gender,
      category,
      parseInt(limit),
    );
  }

  @Post('clear-season-bests')
  @Roles('ADMIN')
  clearSeasonBests(@Query('year') year?: string) {
    const targetYear = year ? parseInt(year) : undefined;
    return this.athletesService.clearSeasonBests(targetYear);
  }
}
