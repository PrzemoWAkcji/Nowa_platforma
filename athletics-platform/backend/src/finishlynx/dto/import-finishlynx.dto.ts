import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FinishlynxEventDto {
  @IsString()
  eventNumber: string;

  @IsString()
  round: string;

  @IsString()
  heat: string;

  @IsString()
  eventName: string;

  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class FinishlynxAthleteResultDto {
  @IsString()
  startNumber: string;

  @IsString()
  position: string;

  @IsString()
  lastName: string;

  @IsString()
  firstName: string;

  @IsString()
  club: string;

  @IsString()
  licenseNumber: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsString()
  reactionTime?: string;

  @IsOptional()
  @IsString()
  wind?: string;

  @IsOptional()
  @IsString()
  status?: string; // DNS, DNF, DQ, etc.
}

export class ImportFinishlynxDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinishlynxEventDto)
  events: FinishlynxEventDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinishlynxAthleteResultDto)
  results: FinishlynxAthleteResultDto[];

  @IsOptional()
  @IsString()
  competitionId?: string;
}

export class ImportFileDto {
  @IsString()
  fileType: 'evt' | 'lif' | 'sch';

  @IsString()
  fileContent: string;

  @IsOptional()
  @IsString()
  competitionId?: string;
}
