import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export enum CompetitionType {
  OUTDOOR = 'OUTDOOR',
  INDOOR = 'INDOOR',
  ROAD = 'ROAD',
  CROSS_COUNTRY = 'CROSS_COUNTRY',
  TRAIL = 'TRAIL',
  DUATHLON = 'DUATHLON',
  TRIATHLON = 'TRIATHLON',
  MULTI_EVENT = 'MULTI_EVENT',
}

export class CreateCompetitionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsEnum(CompetitionType)
  type: CompetitionType;

  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @IsOptional()
  @IsNumber()
  registrationFee?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  allowLateRegistration?: boolean;

  @IsOptional()
  @IsBoolean()
  liveResultsEnabled?: boolean;

  @IsOptional()
  logos?: any; // JSON array of logo objects
}
