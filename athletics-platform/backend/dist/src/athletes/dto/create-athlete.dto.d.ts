export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    MIXED = "MIXED"
}
export declare enum Category {
    U16 = "U16",
    U18 = "U18",
    U20 = "U20",
    SENIOR = "SENIOR",
    M35 = "M35",
    M40 = "M40",
    M45 = "M45",
    M50 = "M50",
    M55 = "M55",
    M60 = "M60",
    M65 = "M65",
    M70 = "M70",
    M75 = "M75",
    M80 = "M80"
}
export declare class CreateAthleteDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    club?: string;
    category: Category;
    nationality?: string;
    classification?: string;
    isParaAthlete?: boolean;
    coachId?: string;
}
