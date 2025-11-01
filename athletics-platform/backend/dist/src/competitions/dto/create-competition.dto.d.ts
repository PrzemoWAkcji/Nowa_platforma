export declare enum CompetitionType {
    OUTDOOR = "OUTDOOR",
    INDOOR = "INDOOR",
    ROAD = "ROAD",
    CROSS_COUNTRY = "CROSS_COUNTRY",
    TRAIL = "TRAIL",
    DUATHLON = "DUATHLON",
    TRIATHLON = "TRIATHLON",
    MULTI_EVENT = "MULTI_EVENT"
}
export declare class CreateCompetitionDto {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    location: string;
    venue?: string;
    type: CompetitionType;
    registrationStartDate?: string;
    registrationEndDate?: string;
    maxParticipants?: number;
    registrationFee?: number;
    isPublic?: boolean;
    allowLateRegistration?: boolean;
    liveResultsEnabled?: boolean;
    logos?: any;
}
