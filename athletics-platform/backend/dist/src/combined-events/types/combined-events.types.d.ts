export declare enum CombinedEventType {
    DECATHLON = "DECATHLON",
    HEPTATHLON = "HEPTATHLON",
    PENTATHLON_INDOOR = "PENTATHLON_INDOOR",
    PENTATHLON_OUTDOOR = "PENTATHLON_OUTDOOR",
    DECATHLON_MASTERS = "DECATHLON_MASTERS",
    HEPTATHLON_MASTERS = "HEPTATHLON_MASTERS",
    PENTATHLON_INDOOR_MASTERS = "PENTATHLON_INDOOR_MASTERS",
    PENTATHLON_OUTDOOR_MASTERS = "PENTATHLON_OUTDOOR_MASTERS",
    THROWS_PENTATHLON_MASTERS = "THROWS_PENTATHLON_MASTERS",
    PENTATHLON_U16_MALE = "PENTATHLON_U16_MALE",
    PENTATHLON_U16_FEMALE = "PENTATHLON_U16_FEMALE"
}
export declare enum CombinedEventDiscipline {
    SPRINT_100M = "100M",
    SPRINT_110M_HURDLES = "110MH",
    SPRINT_100M_HURDLES = "100MH",
    SPRINT_200M = "200M",
    SPRINT_400M = "400M",
    SPRINT_60M = "60M",
    SPRINT_60M_HURDLES = "60MH",
    MIDDLE_800M = "800M",
    MIDDLE_1000M = "1000M",
    MIDDLE_1500M = "1500M",
    SPRINT_80M_HURDLES = "80MH",
    MIDDLE_600M = "600M",
    HIGH_JUMP = "HJ",
    LONG_JUMP = "LJ",
    POLE_VAULT = "PV",
    TRIPLE_JUMP = "TJ",
    SHOT_PUT = "SP",
    DISCUS_THROW = "DT",
    JAVELIN_THROW = "JT",
    HAMMER_THROW = "HT",
    WEIGHT_THROW = "WT",
    SHOT_PUT_3KG = "SP3",
    SHOT_PUT_5KG = "SP5"
}
export interface EventCoefficients {
    A: number;
    B: number;
    C: number;
}
export interface CombinedEventResult {
    discipline: CombinedEventDiscipline;
    performance: string;
    points: number;
    isValid: boolean;
    wind?: string;
}
export interface CombinedEventScore {
    eventType: CombinedEventType;
    results: CombinedEventResult[];
    totalPoints: number;
    isComplete: boolean;
    athleteId: string;
    competitionId: string;
}
export declare const COMBINED_EVENT_DISCIPLINES: {
    DECATHLON: CombinedEventDiscipline[];
    HEPTATHLON: CombinedEventDiscipline[];
    PENTATHLON_INDOOR: CombinedEventDiscipline[];
    PENTATHLON_OUTDOOR: CombinedEventDiscipline[];
    DECATHLON_MASTERS: CombinedEventDiscipline[];
    HEPTATHLON_MASTERS: CombinedEventDiscipline[];
    PENTATHLON_INDOOR_MASTERS: CombinedEventDiscipline[];
    PENTATHLON_OUTDOOR_MASTERS: CombinedEventDiscipline[];
    THROWS_PENTATHLON_MASTERS: CombinedEventDiscipline[];
    PENTATHLON_U16_MALE: CombinedEventDiscipline[];
    PENTATHLON_U16_FEMALE: CombinedEventDiscipline[];
};
