import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum RecordType {
  WORLD = 'WORLD',
  CONTINENTAL = 'CONTINENTAL',
  NATIONAL = 'NATIONAL',
  REGIONAL = 'REGIONAL',
  CLUB = 'CLUB',
  FACILITY = 'FACILITY',
}

export enum RecordLevel {
  SENIOR = 'SENIOR',
  JUNIOR = 'JUNIOR',
  YOUTH = 'YOUTH',
  CADETS = 'CADETS',
  MASTERS = 'MASTERS',
  PARA = 'PARA',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  MIXED = 'MIXED',
}

export enum Unit {
  TIME = 'TIME',
  DISTANCE = 'DISTANCE',
  HEIGHT = 'HEIGHT',
  POINTS = 'POINTS',
}

export class CreateRecordDto {
  @IsEnum(RecordType)
  type: RecordType;

  @IsEnum(RecordLevel)
  level: RecordLevel;

  @IsString()
  eventName: string;

  @IsString()
  discipline: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  category: string;

  @IsString()
  result: string;

  @IsEnum(Unit)
  unit: Unit;

  @IsOptional()
  @IsString()
  wind?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  altitude?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isIndoor?: boolean;

  @IsString()
  athleteName: string;

  @IsString()
  nationality: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsString()
  competitionName: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRatified?: boolean;

  @IsOptional()
  @IsString()
  ratifiedBy?: string;

  @IsOptional()
  @IsDateString()
  ratifiedDate?: string;
}