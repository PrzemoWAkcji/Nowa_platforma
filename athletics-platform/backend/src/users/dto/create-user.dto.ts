import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
} from 'class-validator';

export enum UserRole {
  ATHLETE = 'ATHLETE',
  COACH = 'COACH',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
  JUDGE = 'JUDGE',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
