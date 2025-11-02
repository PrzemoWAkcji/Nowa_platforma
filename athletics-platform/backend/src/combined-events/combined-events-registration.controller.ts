import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CombinedEventsRegistrationService,
  RegisterAthleteForCombinedEventDto,
} from './combined-events-registration.service';
import { GenerateIndividualEventsDto } from './dto/generate-individual-events.dto';
import { CombinedEventType } from './types/combined-events.types';

@Controller('combined-events-registration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CombinedEventsRegistrationController {
  constructor(
    private readonly registrationService: CombinedEventsRegistrationService,
  ) {}

  /**
   * Uproszczona rejestracja zawodnika na wielobój
   */
  @Post('register')
  @Roles('ADMIN', 'ORGANIZER', 'COACH')
  async registerAthlete(@Body() dto: RegisterAthleteForCombinedEventDto) {
    try {
      return await this.registrationService.registerAthleteForCombinedEvent(
        dto,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas rejestracji zawodnika na wielobój';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Masowa rejestracja zawodników na wielobój
   */
  @Post('bulk-register')
  @Roles('ADMIN', 'ORGANIZER', 'COACH')
  async bulkRegisterAthletes(
    @Body()
    dto: {
      athleteIds: string[];
      competitionId: string;
      eventType: CombinedEventType;
      gender: 'MALE' | 'FEMALE';
      createSeparateEvents?: boolean;
    },
  ) {
    try {
      return await this.registrationService.bulkRegisterAthletesForCombinedEvent(
        dto,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas masowej rejestracji zawodników';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Rozdziela wielobój na osobne konkurencje
   */
  @Post('split/:combinedEventId')
  @Roles('ADMIN', 'ORGANIZER')
  async splitCombinedEvent(
    @Param('combinedEventId') combinedEventId: string,
    @Body() dto: { createRegistrations?: boolean },
  ) {
    try {
      return await this.registrationService.splitCombinedEventIntoSeparateEvents(
        {
          combinedEventId,
          createRegistrations: dto.createRegistrations,
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas rozdzielania wieloboju na konkurencje';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Pobiera listę zawodników zarejestrowanych na wieloboje w zawodach
   */
  @Get('competition/:competitionId')
  @Public()
  async getCombinedEventRegistrations(
    @Param('competitionId') competitionId: string,
  ) {
    try {
      return await this.registrationService.getCombinedEventRegistrations(
        competitionId,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas pobierania rejestracji na wieloboje';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Endpoint pomocniczy - informacje o dostępnych wielobojach
   */
  @Get('available-events')
  @Public()
  getAvailableEvents() {
    return [
      {
        type: 'PENTATHLON_U16_MALE',
        name: 'Pięciobój U16 chłopcy',
        description: '110m ppł, Skok w dal, Kula 5kg, Skok wzwyż, 1000m',
        gender: 'MALE',
        disciplines: ['110H', 'LJ', 'SP', 'HJ', '1000M'],
        category: 'U16',
      },
      {
        type: 'PENTATHLON_U16_FEMALE',
        name: 'Pięciobój U16 dziewczęta',
        description: '80m ppł, Skok wzwyż, Kula 3kg, Skok w dal, 600m',
        gender: 'FEMALE',
        disciplines: ['80H', 'HJ', 'SP', 'LJ', '600M'],
        category: 'U16',
      },
      {
        type: 'PENTATHLON_INDOOR',
        name: 'Pięciobój (indoor)',
        description: '60m ppł, Skok wzwyż, Kula, Skok w dal, 800m',
        gender: 'BOTH',
        disciplines: ['60H', 'HJ', 'SP', 'LJ', '800M'],
        category: 'SENIOR',
      },
      {
        type: 'DECATHLON',
        name: 'Dziesięciobój',
        description: 'Oficjalny 10-bój męski',
        gender: 'MALE',
        disciplines: [
          '100M',
          'LJ',
          'SP',
          'HJ',
          '400M',
          '110H',
          'DT',
          'PV',
          'JT',
          '1500M',
        ],
        category: 'SENIOR',
      },
      {
        type: 'HEPTATHLON',
        name: 'Siedmiobój',
        description: 'Oficjalny 7-bój żeński',
        gender: 'FEMALE',
        disciplines: ['100H', 'HJ', 'SP', '200M', 'LJ', 'JT', '800M'],
        category: 'SENIOR',
      },
    ];
  }

  /**
   * Generuje konkurencje składowe wieloboju na podstawie list startowych
   */
  @Post('generate-individual-events')
  @Roles('ADMIN', 'ORGANIZER')
  async generateIndividualEvents(@Body() dto: GenerateIndividualEventsDto) {
    try {
      return await this.registrationService.generateIndividualEventsFromCombinedEvents(
        dto,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas generowania konkurencji składowych';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Pobiera konkurencje wielobojowe dostępne do generowania
   */
  @Get('competition/:competitionId/combined-events-for-generation')
  @Public()
  async getCombinedEventsForGeneration(
    @Param('competitionId') competitionId: string,
  ) {
    try {
      return await this.registrationService.getCombinedEventsForGeneration(
        competitionId,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Błąd podczas pobierania konkurencji wielobojowych';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
