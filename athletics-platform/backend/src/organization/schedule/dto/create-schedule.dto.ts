import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export interface ScheduleGeneratorOptions {
  competitionId: string;
  startDate: string;
  startTime: string;
  breakDuration?: number;
  trackEvents?: string[];
  fieldEvents?: string[];
}

export class CreateScheduleItemDto {
  @IsString()
  eventId: string;

  @IsString()
  scheduledTime: string; // ISO string

  @IsOptional()
  @IsString()
  actualTime?: string;

  @IsOptional()
  duration?: number;

  @IsString()
  round:
    | 'QUALIFICATION'
    | 'SEMIFINAL'
    | 'FINAL'
    | 'QUALIFICATION_A'
    | 'QUALIFICATION_B'
    | 'QUALIFICATION_C';

  @IsOptional()
  seriesCount?: number;

  @IsOptional()
  finalistsCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateScheduleDto {
  @IsString()
  competitionId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleItemDto)
  items: CreateScheduleItemDto[];
}
