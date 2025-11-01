export declare class CreateResultDto {
    athleteId: string;
    eventId: string;
    registrationId: string;
    result: string;
    position?: number;
    points?: number;
    wind?: string;
    reaction?: string;
    splits?: any;
    isValid?: boolean;
    isDNF?: boolean;
    isDNS?: boolean;
    isDQ?: boolean;
    isPersonalBest?: boolean;
    isSeasonBest?: boolean;
    isNationalRecord?: boolean;
    isWorldRecord?: boolean;
}
