import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsJSON,
} from 'class-validator';

export class CreateResultDto {
  @IsString()
  athleteId: string;

  @IsString()
  eventId: string;

  @IsString()
  registrationId: string;

  @IsString()
  result: string; // "10.50", "7.45m", "2:15.30"

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsString()
  wind?: string; // Wind speed for track events

  @IsOptional()
  @IsString()
  reaction?: string; // Reaction time

  @IsOptional()
  @IsJSON()
  splits?: any; // Split times for longer events

  @IsOptional()
  @IsBoolean()
  isValid?: boolean;

  @IsOptional()
  @IsBoolean()
  isDNF?: boolean; // Did Not Finish

  @IsOptional()
  @IsBoolean()
  isDNS?: boolean; // Did Not Start

  @IsOptional()
  @IsBoolean()
  isDQ?: boolean; // Disqualified

  @IsOptional()
  @IsBoolean()
  isPersonalBest?: boolean;

  @IsOptional()
  @IsBoolean()
  isSeasonBest?: boolean;

  @IsOptional()
  @IsBoolean()
  isNationalRecord?: boolean;

  @IsOptional()
  @IsBoolean()
  isWorldRecord?: boolean;
}
