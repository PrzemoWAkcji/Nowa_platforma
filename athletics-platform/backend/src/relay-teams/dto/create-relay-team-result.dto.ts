import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, Min, Matches } from 'class-validator';

export class CreateRelayTeamResultDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,2}:\d{2}\.\d{2}$/, {
    message: 'Wynik musi być w formacie MM:SS.CC (np. 3:25.45)'
  })
  result: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  position?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  points?: number;

  @IsString()
  @IsOptional()
  wind?: string;

  @IsString()
  @IsOptional()
  reaction?: string;

  @IsOptional()
  splits?: any; // JSON with split times

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isValid?: boolean;

  @IsBoolean()
  @IsOptional()
  isDNF?: boolean;

  @IsBoolean()
  @IsOptional()
  isDNS?: boolean;

  @IsBoolean()
  @IsOptional()
  isDQ?: boolean;

  @IsBoolean()
  @IsOptional()
  isNationalRecord?: boolean;

  @IsBoolean()
  @IsOptional()
  isWorldRecord?: boolean;
}