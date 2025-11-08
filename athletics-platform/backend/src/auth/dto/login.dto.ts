import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  @IsNotEmpty({ message: 'Email jest wymagany' })
  email: string;

  @IsString({ message: 'Hasło musi być tekstem' })
  @IsNotEmpty({ message: 'Hasło jest wymagane' })
  password: string;
}
