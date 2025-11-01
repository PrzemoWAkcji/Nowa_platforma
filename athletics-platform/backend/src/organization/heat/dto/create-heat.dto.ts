import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHeatAssignmentDto {
  @IsString()
  registrationId: string;

  @IsOptional()
  @IsNumber()
  lane?: number;

  @IsOptional()
  @IsString()
  seedTime?: string;

  @IsOptional()
  @IsNumber()
  seedRank?: number;

  @IsOptional()
  @IsString()
  assignmentMethod?:
    | 'MANUAL'
    | 'SEED_TIME'
    | 'RANDOM'
    | 'SERPENTINE'
    | 'STRAIGHT_FINAL';

  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;
}

export class CreateHeatDto {
  @IsString()
  eventId: string;

  @IsNumber()
  heatNumber: number;

  @IsString()
  round:
    | 'QUALIFICATION'
    | 'SEMIFINAL'
    | 'FINAL'
    | 'QUALIFICATION_A'
    | 'QUALIFICATION_B'
    | 'QUALIFICATION_C';

  @IsOptional()
  @IsNumber()
  maxLanes?: number;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHeatAssignmentDto)
  assignments?: CreateHeatAssignmentDto[];
}
