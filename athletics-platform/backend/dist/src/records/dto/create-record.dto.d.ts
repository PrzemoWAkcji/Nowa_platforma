export declare enum RecordType {
    WORLD = "WORLD",
    CONTINENTAL = "CONTINENTAL",
    NATIONAL = "NATIONAL",
    REGIONAL = "REGIONAL",
    CLUB = "CLUB",
    FACILITY = "FACILITY"
}
export declare enum RecordLevel {
    SENIOR = "SENIOR",
    JUNIOR = "JUNIOR",
    YOUTH = "YOUTH",
    CADETS = "CADETS",
    MASTERS = "MASTERS",
    PARA = "PARA"
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    MIXED = "MIXED"
}
export declare enum Unit {
    TIME = "TIME",
    DISTANCE = "DISTANCE",
    HEIGHT = "HEIGHT",
    POINTS = "POINTS"
}
export declare class CreateRecordDto {
    type: RecordType;
    level: RecordLevel;
    eventName: string;
    discipline: string;
    gender: Gender;
    category: string;
    result: string;
    unit: Unit;
    wind?: string;
    altitude?: number;
    isIndoor?: boolean;
    athleteName: string;
    nationality: string;
    dateOfBirth?: string;
    competitionName: string;
    location: string;
    venue?: string;
    date: string;
    isRatified?: boolean;
    ratifiedBy?: string;
    ratifiedDate?: string;
}
