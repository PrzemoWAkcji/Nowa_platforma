import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  athleteId: string;

  @IsString()
  competitionId: string;

  @IsArray()
  @IsString({ each: true })
  eventIds: string[];

  @IsOptional()
  @IsString()
  seedTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  paymentAmount?: number;

  @IsOptional()
  @IsString()
  bibNumber?: string;
}
