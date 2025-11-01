import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum AssignmentMethodEnum {
  // Podstawowe metody
  MANUAL = 'MANUAL',
  SEED_TIME = 'SEED_TIME',
  RANDOM = 'RANDOM',
  SERPENTINE = 'SERPENTINE',
  STRAIGHT_FINAL = 'STRAIGHT_FINAL',

  // Metody podziału na serie/grupy (zgodnie z Roster Athletics)
  ALPHABETICAL_NUMBER = 'ALPHABETICAL_NUMBER',
  ALPHABETICAL_NAME = 'ALPHABETICAL_NAME',
  ROUND_ROBIN = 'ROUND_ROBIN',
  ZIGZAG = 'ZIGZAG',
  BY_RESULT = 'BY_RESULT',
  BY_RESULT_INDOOR = 'BY_RESULT_INDOOR',

  // Metody przypisania do toru/kolejności
  BEST_TO_WORST = 'BEST_TO_WORST',
  WORST_TO_BEST = 'WORST_TO_BEST',
  HALF_AND_HALF = 'HALF_AND_HALF',
  PAIRS = 'PAIRS',
  PAIRS_INDOOR = 'PAIRS_INDOOR',
  STANDARD_OUTSIDE = 'STANDARD_OUTSIDE',
  STANDARD_INSIDE = 'STANDARD_INSIDE',
  WATERFALL = 'WATERFALL',
  WATERFALL_REVERSE = 'WATERFALL_REVERSE',

  // World Athletics standardy
  WA_HALVES_AND_PAIRS = 'WA_HALVES_AND_PAIRS',
  WA_SPRINTS_STRAIGHT = 'WA_SPRINTS_STRAIGHT',
  WA_200M = 'WA_200M',
  WA_400M_800M = 'WA_400M_800M',
  WA_9_LANES = 'WA_9_LANES',
}

export class AutoAssignDto {
  @IsString()
  eventId: string;

  @IsString()
  round:
    | 'QUALIFICATION'
    | 'SEMIFINAL'
    | 'FINAL'
    | 'QUALIFICATION_A'
    | 'QUALIFICATION_B'
    | 'QUALIFICATION_C';

  @IsEnum(AssignmentMethodEnum)
  method: AssignmentMethodEnum;

  @IsOptional()
  @IsNumber()
  maxLanes?: number;

  @IsOptional()
  @IsNumber()
  heatsCount?: number; // Liczba serii (jeśli nie podana, zostanie wyliczona automatycznie)

  @IsOptional()
  @IsNumber()
  finalistsCount?: number; // Liczba finalistów (dla eliminacji)
}

export class AdvancedAutoAssignDto {
  @IsString()
  eventId: string;

  @IsString()
  round:
    | 'QUALIFICATION'
    | 'SEMIFINAL'
    | 'FINAL'
    | 'QUALIFICATION_A'
    | 'QUALIFICATION_B'
    | 'QUALIFICATION_C';

  // Metoda podziału na serie/grupy
  @IsEnum(AssignmentMethodEnum)
  seriesMethod: AssignmentMethodEnum;

  // Metoda przypisania do torów w ramach serii
  @IsEnum(AssignmentMethodEnum)
  laneMethod: AssignmentMethodEnum;

  @IsOptional()
  @IsNumber()
  maxLanes?: number;

  @IsOptional()
  @IsNumber()
  heatsCount?: number;

  @IsOptional()
  @IsNumber()
  finalistsCount?: number;

  // Dodatkowe opcje
  @IsOptional()
  @IsNumber()
  maxLanesIndoor?: number; // Dla metod halowych

  @IsOptional()
  seedingCriteria?:
    | 'SEED_TIME'
    | 'SEASON_BEST'
    | 'PERSONAL_BEST'
    | 'QUALIFICATION_RESULT';
}
