export declare class CreateHeatAssignmentDto {
    registrationId: string;
    lane?: number;
    seedTime?: string;
    seedRank?: number;
    assignmentMethod?: 'MANUAL' | 'SEED_TIME' | 'RANDOM' | 'SERPENTINE' | 'STRAIGHT_FINAL';
    isPresent?: boolean;
}
export declare class CreateHeatDto {
    eventId: string;
    heatNumber: number;
    round: 'QUALIFICATION' | 'SEMIFINAL' | 'FINAL' | 'QUALIFICATION_A' | 'QUALIFICATION_B' | 'QUALIFICATION_C';
    maxLanes?: number;
    scheduledTime?: string;
    notes?: string;
    assignments?: CreateHeatAssignmentDto[];
}
