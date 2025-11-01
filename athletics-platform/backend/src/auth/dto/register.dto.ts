import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  @IsNotEmpty({ message: 'Email jest wymagany' })
  email: string;

  @IsString({ message: 'Hasło musi być tekstem' })
  @IsNotEmpty({ message: 'Hasło jest wymagane' })
  @MinLength(8, { message: 'Hasło musi mieć co najmniej 8 znaków' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Hasło musi zawierać co najmniej jedną małą literę, jedną wielką literę, jedną cyfrę i jeden znak specjalny',
  })
  password: string;

  @IsString({ message: 'Imię musi być tekstem' })
  @IsNotEmpty({ message: 'Imię jest wymagane' })
  firstName: string;

  @IsString({ message: 'Nazwisko musi być tekstem' })
  @IsNotEmpty({ message: 'Nazwisko jest wymagane' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Telefon musi być tekstem' })
  phone?: string;

  @IsEnum(UserRole, { message: 'Rola musi być jedną z: ATHLETE, COACH, ADMIN' })
  @IsNotEmpty({ message: 'Rola jest wymagana' })
  role: UserRole;
}
