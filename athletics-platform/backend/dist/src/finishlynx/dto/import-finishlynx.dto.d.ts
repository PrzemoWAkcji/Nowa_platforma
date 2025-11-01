export declare class FinishlynxEventDto {
    eventNumber: string;
    round: string;
    heat: string;
    eventName: string;
    timestamp?: string;
}
export declare class FinishlynxAthleteResultDto {
    startNumber: string;
    position: string;
    lastName: string;
    firstName: string;
    club: string;
    licenseNumber: string;
    result?: string;
    reactionTime?: string;
    wind?: string;
    status?: string;
}
export declare class ImportFinishlynxDto {
    events: FinishlynxEventDto[];
    results: FinishlynxAthleteResultDto[];
    competitionId?: string;
}
export declare class ImportFileDto {
    fileType: 'evt' | 'lif' | 'sch';
    fileContent: string;
    competitionId?: string;
}
