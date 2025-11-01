import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { CombinedEventType } from '../types/combined-events.types';

export class CreateCombinedEventDto {
  @IsEnum(CombinedEventType)
  eventType: CombinedEventType;

  @IsString()
  @IsNotEmpty()
  athleteId: string;

  @IsString()
  @IsNotEmpty()
  competitionId: string;

  @IsEnum(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';
}
