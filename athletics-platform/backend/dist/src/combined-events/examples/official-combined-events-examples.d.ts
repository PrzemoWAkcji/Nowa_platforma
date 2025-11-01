import { CombinedEventType, CombinedEventDiscipline } from '../types/combined-events.types';
export declare const DECATHLON_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare const HEPTATHLON_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare const PENTATHLON_INDOOR_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
    }[];
    expectedTotalPoints: number;
};
export declare const PENTATHLON_OUTDOOR_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare const DECATHLON_MASTERS_M50_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note: string;
    })[];
    expectedTotalPoints: number;
};
export declare const HEPTATHLON_MASTERS_W45_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note: string;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare const PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare const PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare const THROWS_PENTATHLON_MASTERS_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
    }[];
    expectedTotalPoints: number;
};
export declare const PENTATHLON_U16_MALE_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare const PENTATHLON_U16_FEMALE_EXAMPLE: {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
};
export declare function getExampleForEventType(eventType: CombinedEventType, gender?: 'MALE' | 'FEMALE'): {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
    }[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note: string;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note: string;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
    }[];
    expectedTotalPoints: number;
};
export declare function getAllMastersExamples(): ({
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note: string;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note: string;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
    }[];
    expectedTotalPoints: number;
})[];
export declare function getAllOfficialExamples(): ({
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
    }[];
    expectedTotalPoints: number;
})[];
export declare function getAllCustomExamples(): ({
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "MALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    })[];
    expectedTotalPoints: number;
} | {
    eventType: CombinedEventType;
    athleteId: string;
    competitionId: string;
    gender: "FEMALE";
    ageGroup: string;
    note: string;
    sampleResults: ({
        discipline: CombinedEventDiscipline;
        performance: string;
        wind: string;
        expectedPoints: number;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        wind?: undefined;
        note?: undefined;
    } | {
        discipline: CombinedEventDiscipline;
        performance: string;
        expectedPoints: number;
        note: string;
        wind?: undefined;
    })[];
    expectedTotalPoints: number;
})[];
