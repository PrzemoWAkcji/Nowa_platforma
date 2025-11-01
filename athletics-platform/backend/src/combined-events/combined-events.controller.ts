import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaginationDto, createPaginatedResult } from '../common/dto/pagination.dto';
import { CombinedEventsService } from './combined-events.service';
import { CreateCombinedEventDto } from './dto/create-combined-event.dto';
import { UpdateCombinedEventResultDto } from './dto/update-combined-event-result.dto';
import { CalculatePointsDto } from './dto/calculate-points.dto';
import { ValidatePerformanceDto } from './dto/validate-performance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CombinedEventType } from './types/combined-events.types';

@Controller('combined-events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CombinedEventsController {
  constructor(private readonly combinedEventsService: CombinedEventsService) {}

  /**
   * Pobiera dostępne typy wielobojów
   */
  @Get('types')
  @Public()
  getEventTypes() {
    return this.combinedEventsService.getAvailableEventTypes();
  }

  /**
   * Pobiera dyscypliny dla konkretnego typu wieloboju
   */
  @Get('types/:eventType/disciplines')
  @Public()
  getDisciplines(
    @Param('eventType') eventType: CombinedEventType,
    @Query('gender') gender?: 'MALE' | 'FEMALE',
  ) {
    try {
      // Validate eventType
      if (!Object.values(CombinedEventType).includes(eventType)) {
        throw new HttpException(
          `Invalid event type: ${eventType}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Ensure gender has a valid default value
      const validGender = gender === 'FEMALE' ? 'FEMALE' : 'MALE';
      
      const disciplines = this.combinedEventsService.getDisciplinesForEvent(
        eventType,
        validGender,
      );
      return { eventType, gender: validGender, disciplines };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas pobierania dyscyplin';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Tworzy nowy wielobój
   */
  @Post()
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  async create(@Body() createDto: CreateCombinedEventDto) {
    try {
      return await this.combinedEventsService.createCombinedEvent(createDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas tworzenia wieloboju';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Pobiera szczegóły wieloboju
   */
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const combinedEvent = await this.combinedEventsService.getCombinedEvent(id);

    if (!combinedEvent) {
      throw new HttpException(
        'Wielobój nie został znaleziony',
        HttpStatus.NOT_FOUND,
      );
    }

    return combinedEvent;
  }

  /**
   * Pobiera wszystkie wieloboje dla zawodów
   */
  @Get('competition/:competitionId')
  @Public()
  async findByCompetition(@Param('competitionId') competitionId: string) {
    return await this.combinedEventsService.getCombinedEventsByCompetition(
      competitionId,
    );
  }

  /**
   * Pobiera ranking wieloboju
   */
  @Get('competition/:competitionId/ranking')
  @Public()
  async getRanking(
    @Param('competitionId') competitionId: string,
    @Query('eventType') eventType: CombinedEventType,
  ) {
    if (!eventType) {
      throw new HttpException(
        'Typ wieloboju jest wymagany',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.combinedEventsService.getCombinedEventRanking(
      competitionId,
      eventType,
    );
  }

  /**
   * Pobiera statystyki wielobojów dla zawodów
   */
  @Get('competition/:competitionId/statistics')
  @Public()
  async getStatistics(@Param('competitionId') competitionId: string) {
    return await this.combinedEventsService.getCombinedEventStatistics(
      competitionId,
    );
  }

  /**
   * Aktualizuje wynik w konkretnej dyscyplinie
   */
  @Put(':id/discipline/:discipline')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  async updateResult(
    @Param('id') id: string,
    @Param('discipline') discipline: string,
    @Body() updateDto: UpdateCombinedEventResultDto,
  ) {
    try {
      // Walidacja wyniku
      const isValid = this.combinedEventsService.validatePerformance(
        discipline,
        updateDto.performance,
      );

      if (!isValid) {
        throw new HttpException(
          'Nieprawidłowy format wyniku',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.combinedEventsService.updateEventResult(
        id,
        discipline,
        updateDto,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas aktualizacji wyniku';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Przelicza punkty wieloboju
   */
  @Put(':id/recalculate')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  async recalculate(@Param('id') id: string) {
    try {
      return await this.combinedEventsService.recalculateTotalPoints(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas przeliczania punktów';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Usuwa wielobój
   */
  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async remove(@Param('id') id: string) {
    try {
      return await this.combinedEventsService.deleteCombinedEvent(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas usuwania wieloboju';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Oblicza punkty dla konkretnego wyniku (endpoint pomocniczy)
   */
  @Post('calculate-points')
  @Public()
  calculatePoints(@Body() calculatePointsDto: CalculatePointsDto) {
    try {
      // Validate performance format
      const isValidPerformance = this.combinedEventsService.validatePerformance(
        calculatePointsDto.discipline,
        calculatePointsDto.performance,
      );

      if (!isValidPerformance) {
        throw new HttpException(
          'Invalid performance format or value',
          HttpStatus.BAD_REQUEST,
        );
      }

      const points = this.combinedEventsService.calculatePoints(
        calculatePointsDto.discipline,
        calculatePointsDto.performance,
        calculatePointsDto.gender || 'MALE',
      );

      return { points };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas obliczania punktów';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Waliduje format wyniku (endpoint pomocniczy)
   */
  @Post('validate-performance')
  @Public()
  validatePerformance(@Body() validatePerformanceDto: ValidatePerformanceDto) {
    const isValid = this.combinedEventsService.validatePerformance(
      validatePerformanceDto.discipline,
      validatePerformanceDto.performance,
    );

    return { isValid };
  }
}
