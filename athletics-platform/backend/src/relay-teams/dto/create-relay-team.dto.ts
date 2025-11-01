import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRelayTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  club?: string;

  @IsString()
  @IsNotEmpty()
  competitionId: string;
}