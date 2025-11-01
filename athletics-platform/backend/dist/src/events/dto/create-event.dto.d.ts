export declare enum EventType {
    TRACK = "TRACK",
    FIELD = "FIELD",
    ROAD = "ROAD",
    COMBINED = "COMBINED",
    RELAY = "RELAY"
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    MIXED = "MIXED"
}
export declare enum Category {
    WIELE = "WIELE",
    AGE_0_11 = "AGE_0_11",
    AGE_5 = "AGE_5",
    AGE_6 = "AGE_6",
    AGE_7 = "AGE_7",
    AGE_8 = "AGE_8",
    AGE_9 = "AGE_9",
    AGE_10 = "AGE_10",
    AGE_11 = "AGE_11",
    AGE_12 = "AGE_12",
    AGE_13 = "AGE_13",
    AGE_14 = "AGE_14",
    AGE_15 = "AGE_15",
    AGE_16 = "AGE_16",
    AGE_17 = "AGE_17",
    AGE_18 = "AGE_18",
    AGE_19 = "AGE_19",
    AGE_20 = "AGE_20",
    AGE_21 = "AGE_21",
    AGE_22 = "AGE_22",
    CLASS_1_SZKOLA_SREDNIA = "CLASS_1_SZKOLA_SREDNIA",
    CLASS_2_SZKOLA_SREDNIA = "CLASS_2_SZKOLA_SREDNIA",
    CLASS_3_SZKOLA_SREDNIA = "CLASS_3_SZKOLA_SREDNIA",
    CLASS_4_SZKOLA_SREDNIA = "CLASS_4_SZKOLA_SREDNIA",
    CLASS_5_SZKOLA_SREDNIA = "CLASS_5_SZKOLA_SREDNIA",
    CLASS_6_SZKOLA_SREDNIA = "CLASS_6_SZKOLA_SREDNIA",
    CLASS_7 = "CLASS_7",
    CLASS_8 = "CLASS_8",
    U8 = "U8",
    U9 = "U9",
    U10 = "U10",
    U11 = "U11",
    U12 = "U12",
    U13 = "U13",
    U14 = "U14",
    U15 = "U15",
    U16 = "U16",
    U18 = "U18",
    U20 = "U20",
    U23 = "U23",
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
    M80 = "M80",
    M85 = "M85",
    M90 = "M90",
    M95 = "M95",
    M100 = "M100",
    M105 = "M105",
    M110 = "M110"
}
export declare enum Unit {
    TIME = "TIME",
    DISTANCE = "DISTANCE",
    HEIGHT = "HEIGHT",
    POINTS = "POINTS"
}
export declare class CreateEventDto {
    name: string;
    type: EventType;
    gender: Gender;
    category: Category;
    unit: Unit;
    competitionId: string;
    maxParticipants?: number;
    seedTimeRequired?: boolean;
    discipline?: string;
    distance?: string;
    scheduledTime?: string;
}
