import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  MIXED = 'MIXED',
}

export enum Category {
  U16 = 'U16',
  U18 = 'U18',
  U20 = 'U20',
  SENIOR = 'SENIOR',
  M35 = 'M35',
  M40 = 'M40',
  M45 = 'M45',
  M50 = 'M50',
  M55 = 'M55',
  M60 = 'M60',
  M65 = 'M65',
  M70 = 'M70',
  M75 = 'M75',
  M80 = 'M80',
}

export class CreateAthleteDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  club?: string;

  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  classification?: string;

  @IsOptional()
  @IsBoolean()
  isParaAthlete?: boolean;

  @IsOptional()
  @IsString()
  coachId?: string;
}
