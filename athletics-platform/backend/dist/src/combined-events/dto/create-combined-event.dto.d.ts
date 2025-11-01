import { CombinedEventType } from '../types/combined-events.types';
export declare class CreateCombinedEventDto {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: 'MALE' | 'FEMALE';
}
