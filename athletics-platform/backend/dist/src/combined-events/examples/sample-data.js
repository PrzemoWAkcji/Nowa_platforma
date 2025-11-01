"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORLD_RECORDS = exports.SAMPLE_PENTATHLON_U16_FEMALE_RESULTS = exports.SAMPLE_PENTATHLON_U16_MALE_RESULTS = exports.SAMPLE_PENTATHLON_RESULTS = exports.SAMPLE_HEPTATHLON_RESULTS = exports.SAMPLE_DECATHLON_RESULTS = void 0;
exports.generateSampleCombinedEvent = generateSampleCombinedEvent;
exports.SAMPLE_DECATHLON_RESULTS = {
    excellent: {
        '100M': '10.50',
        LJ: '7.45',
        SP: '15.50',
        HJ: '2.15',
        '400M': '47.50',
        '110MH': '13.80',
        DT: '48.00',
        PV: '5.20',
        JT: '65.00',
        '1500M': '4:15.30',
    },
    good: {
        '100M': '11.00',
        LJ: '7.00',
        SP: '14.00',
        HJ: '2.00',
        '400M': '49.00',
        '110MH': '14.50',
        DT: '42.00',
        PV: '4.80',
        JT: '58.00',
        '1500M': '4:30.00',
    },
    average: {
        '100M': '11.50',
        LJ: '6.50',
        SP: '12.50',
        HJ: '1.85',
        '400M': '51.00',
        '110MH': '15.50',
        DT: '38.00',
        PV: '4.40',
        JT: '52.00',
        '1500M': '4:45.00',
    },
};
exports.SAMPLE_HEPTATHLON_RESULTS = {
    excellent: {
        '100MH': '13.00',
        HJ: '1.85',
        SP: '15.00',
        '200M': '23.50',
        LJ: '6.50',
        JT: '50.00',
        '800M': '2:10.00',
    },
    good: {
        '100MH': '13.50',
        HJ: '1.75',
        SP: '13.50',
        '200M': '24.50',
        LJ: '6.20',
        JT: '45.00',
        '800M': '2:15.00',
    },
    average: {
        '100MH': '14.50',
        HJ: '1.65',
        SP: '12.00',
        '200M': '25.50',
        LJ: '5.80',
        JT: '40.00',
        '800M': '2:20.00',
    },
};
exports.SAMPLE_PENTATHLON_RESULTS = {
    excellent: {
        '60MH': '8.00',
        HJ: '1.85',
        SP: '15.00',
        LJ: '6.50',
        '800M': '2:10.00',
    },
    good: {
        '60MH': '8.50',
        HJ: '1.75',
        SP: '13.50',
        LJ: '6.20',
        '800M': '2:15.00',
    },
    average: {
        '60MH': '9.00',
        HJ: '1.65',
        SP: '12.00',
        LJ: '5.80',
        '800M': '2:20.00',
    },
};
exports.SAMPLE_PENTATHLON_U16_MALE_RESULTS = {
    excellent: {
        '110MH': '14.00',
        LJ: '6.50',
        SP5: '14.50',
        HJ: '1.90',
        '1000M': '2:45.00',
    },
    good: {
        '110MH': '14.50',
        LJ: '6.20',
        SP5: '13.50',
        HJ: '1.85',
        '1000M': '2:50.00',
    },
    average: {
        '110MH': '15.00',
        LJ: '5.90',
        SP5: '12.50',
        HJ: '1.75',
        '1000M': '2:55.00',
    },
};
exports.SAMPLE_PENTATHLON_U16_FEMALE_RESULTS = {
    excellent: {
        '80MH': '11.50',
        HJ: '1.75',
        SP3: '12.00',
        LJ: '5.90',
        '600M': '1:32.00',
    },
    good: {
        '80MH': '12.00',
        HJ: '1.70',
        SP3: '11.50',
        LJ: '5.80',
        '600M': '1:35.00',
    },
    average: {
        '80MH': '12.50',
        HJ: '1.65',
        SP3: '10.50',
        LJ: '5.60',
        '600M': '1:40.00',
    },
};
function generateSampleCombinedEvent(eventType, level = 'good') {
    switch (eventType) {
        case 'DECATHLON':
            return exports.SAMPLE_DECATHLON_RESULTS[level];
        case 'HEPTATHLON':
            return exports.SAMPLE_HEPTATHLON_RESULTS[level];
        case 'PENTATHLON_U16_MALE':
            return exports.SAMPLE_PENTATHLON_U16_MALE_RESULTS[level];
        case 'PENTATHLON_U16_FEMALE':
            return exports.SAMPLE_PENTATHLON_U16_FEMALE_RESULTS[level];
        case 'PENTATHLON':
            return exports.SAMPLE_PENTATHLON_RESULTS[level];
        default:
            throw new Error(`Unknown event type: ${String(eventType)}`);
    }
}
exports.WORLD_RECORDS = {
    DECATHLON: {
        points: 9126,
        results: {
            '100M': '10.55',
            LJ: '7.80',
            SP: '16.00',
            HJ: '2.05',
            '400M': '48.42',
            '110MH': '13.75',
            DT: '50.54',
            PV: '5.45',
            JT: '71.90',
            '1500M': '4:36.11',
        },
    },
    HEPTATHLON: {
        points: 7291,
        results: {
            '100MH': '12.69',
            HJ: '1.86',
            SP: '15.80',
            '200M': '22.56',
            LJ: '7.27',
            JT: '45.66',
            '800M': '2:08.51',
        },
    },
};
//# sourceMappingURL=sample-data.js.map