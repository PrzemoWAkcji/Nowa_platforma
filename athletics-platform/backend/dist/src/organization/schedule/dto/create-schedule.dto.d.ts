export interface ScheduleGeneratorOptions {
    competitionId: string;
    startDate: string;
    startTime: string;
    breakDuration?: number;
    trackEvents?: string[];
    fieldEvents?: string[];
}
export declare class CreateScheduleItemDto {
    eventId: string;
    scheduledTime: string;
    actualTime?: string;
    duration?: number;
    round: 'QUALIFICATION' | 'SEMIFINAL' | 'FINAL' | 'QUALIFICATION_A' | 'QUALIFICATION_B' | 'QUALIFICATION_C';
    seriesCount?: number;
    finalistsCount?: number;
    notes?: string;
}
export declare class CreateScheduleDto {
    competitionId: string;
    name: string;
    description?: string;
    isPublished?: boolean;
    items: CreateScheduleItemDto[];
}
