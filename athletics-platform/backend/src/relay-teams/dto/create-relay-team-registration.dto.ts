import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateRelayTeamRegistrationDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1,2}:\d{2}\.\d{2}$/, {
    message: 'Czas zgłoszeniowy musi być w formacie MM:SS.CC (np. 3:25.45)'
  })
  seedTime?: string;
}