export declare enum AssignmentMethodEnum {
    MANUAL = "MANUAL",
    SEED_TIME = "SEED_TIME",
    RANDOM = "RANDOM",
    SERPENTINE = "SERPENTINE",
    STRAIGHT_FINAL = "STRAIGHT_FINAL",
    ALPHABETICAL_NUMBER = "ALPHABETICAL_NUMBER",
    ALPHABETICAL_NAME = "ALPHABETICAL_NAME",
    ROUND_ROBIN = "ROUND_ROBIN",
    ZIGZAG = "ZIGZAG",
    BY_RESULT = "BY_RESULT",
    BY_RESULT_INDOOR = "BY_RESULT_INDOOR",
    BEST_TO_WORST = "BEST_TO_WORST",
    WORST_TO_BEST = "WORST_TO_BEST",
    HALF_AND_HALF = "HALF_AND_HALF",
    PAIRS = "PAIRS",
    PAIRS_INDOOR = "PAIRS_INDOOR",
    STANDARD_OUTSIDE = "STANDARD_OUTSIDE",
    STANDARD_INSIDE = "STANDARD_INSIDE",
    WATERFALL = "WATERFALL",
    WATERFALL_REVERSE = "WATERFALL_REVERSE",
    WA_HALVES_AND_PAIRS = "WA_HALVES_AND_PAIRS",
    WA_SPRINTS_STRAIGHT = "WA_SPRINTS_STRAIGHT",
    WA_200M = "WA_200M",
    WA_400M_800M = "WA_400M_800M",
    WA_9_LANES = "WA_9_LANES"
}
export declare class AutoAssignDto {
    eventId: string;
    round: 'QUALIFICATION' | 'SEMIFINAL' | 'FINAL' | 'QUALIFICATION_A' | 'QUALIFICATION_B' | 'QUALIFICATION_C';
    method: AssignmentMethodEnum;
    maxLanes?: number;
    heatsCount?: number;
    finalistsCount?: number;
}
export declare class AdvancedAutoAssignDto {
    eventId: string;
    round: 'QUALIFICATION' | 'SEMIFINAL' | 'FINAL' | 'QUALIFICATION_A' | 'QUALIFICATION_B' | 'QUALIFICATION_C';
    seriesMethod: AssignmentMethodEnum;
    laneMethod: AssignmentMethodEnum;
    maxLanes?: number;
    heatsCount?: number;
    finalistsCount?: number;
    maxLanesIndoor?: number;
    seedingCriteria?: 'SEED_TIME' | 'SEASON_BEST' | 'PERSONAL_BEST' | 'QUALIFICATION_RESULT';
}
