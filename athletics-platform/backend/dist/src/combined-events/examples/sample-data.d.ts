export declare const SAMPLE_DECATHLON_RESULTS: {
    excellent: {
        '100M': string;
        LJ: string;
        SP: string;
        HJ: string;
        '400M': string;
        '110MH': string;
        DT: string;
        PV: string;
        JT: string;
        '1500M': string;
    };
    good: {
        '100M': string;
        LJ: string;
        SP: string;
        HJ: string;
        '400M': string;
        '110MH': string;
        DT: string;
        PV: string;
        JT: string;
        '1500M': string;
    };
    average: {
        '100M': string;
        LJ: string;
        SP: string;
        HJ: string;
        '400M': string;
        '110MH': string;
        DT: string;
        PV: string;
        JT: string;
        '1500M': string;
    };
};
export declare const SAMPLE_HEPTATHLON_RESULTS: {
    excellent: {
        '100MH': string;
        HJ: string;
        SP: string;
        '200M': string;
        LJ: string;
        JT: string;
        '800M': string;
    };
    good: {
        '100MH': string;
        HJ: string;
        SP: string;
        '200M': string;
        LJ: string;
        JT: string;
        '800M': string;
    };
    average: {
        '100MH': string;
        HJ: string;
        SP: string;
        '200M': string;
        LJ: string;
        JT: string;
        '800M': string;
    };
};
export declare const SAMPLE_PENTATHLON_RESULTS: {
    excellent: {
        '60MH': string;
        HJ: string;
        SP: string;
        LJ: string;
        '800M': string;
    };
    good: {
        '60MH': string;
        HJ: string;
        SP: string;
        LJ: string;
        '800M': string;
    };
    average: {
        '60MH': string;
        HJ: string;
        SP: string;
        LJ: string;
        '800M': string;
    };
};
export declare const SAMPLE_PENTATHLON_U16_MALE_RESULTS: {
    excellent: {
        '110MH': string;
        LJ: string;
        SP5: string;
        HJ: string;
        '1000M': string;
    };
    good: {
        '110MH': string;
        LJ: string;
        SP5: string;
        HJ: string;
        '1000M': string;
    };
    average: {
        '110MH': string;
        LJ: string;
        SP5: string;
        HJ: string;
        '1000M': string;
    };
};
export declare const SAMPLE_PENTATHLON_U16_FEMALE_RESULTS: {
    excellent: {
        '80MH': string;
        HJ: string;
        SP3: string;
        LJ: string;
        '600M': string;
    };
    good: {
        '80MH': string;
        HJ: string;
        SP3: string;
        LJ: string;
        '600M': string;
    };
    average: {
        '80MH': string;
        HJ: string;
        SP3: string;
        LJ: string;
        '600M': string;
    };
};
export declare function generateSampleCombinedEvent(eventType: 'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON' | 'PENTATHLON_U16_MALE' | 'PENTATHLON_U16_FEMALE', level?: 'excellent' | 'good' | 'average'): {
    '100M': string;
    LJ: string;
    SP: string;
    HJ: string;
    '400M': string;
    '110MH': string;
    DT: string;
    PV: string;
    JT: string;
    '1500M': string;
} | {
    '100MH': string;
    HJ: string;
    SP: string;
    '200M': string;
    LJ: string;
    JT: string;
    '800M': string;
} | {
    '60MH': string;
    HJ: string;
    SP: string;
    LJ: string;
    '800M': string;
} | {
    '110MH': string;
    LJ: string;
    SP5: string;
    HJ: string;
    '1000M': string;
} | {
    '80MH': string;
    HJ: string;
    SP3: string;
    LJ: string;
    '600M': string;
};
export declare const WORLD_RECORDS: {
    DECATHLON: {
        points: number;
        results: {
            '100M': string;
            LJ: string;
            SP: string;
            HJ: string;
            '400M': string;
            '110MH': string;
            DT: string;
            PV: string;
            JT: string;
            '1500M': string;
        };
    };
    HEPTATHLON: {
        points: number;
        results: {
            '100MH': string;
            HJ: string;
            SP: string;
            '200M': string;
            LJ: string;
            JT: string;
            '800M': string;
        };
    };
};
