import { IsString, IsNotEmpty, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class AddRelayTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  athleteId: string;

  @IsInt()
  @Min(1)
  @Max(6)
  position: number;

  @IsBoolean()
  @IsOptional()
  isReserve?: boolean;
}