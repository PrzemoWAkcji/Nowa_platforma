import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  @IsNotEmpty({ message: 'Email jest wymagany' })
  email: string;

  @IsString({ message: 'Hasło musi być tekstem' })
  @IsNotEmpty({ message: 'Hasło jest wymagane' })
  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków' })
  password: string;
}
