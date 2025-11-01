"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCORING_COEFFICIENTS = void 0;
exports.getScoringCoefficients = getScoringCoefficients;
exports.parseTimeToSeconds = parseTimeToSeconds;
exports.parseDistanceToMeters = parseDistanceToMeters;
exports.parseHeightToMeters = parseHeightToMeters;
exports.isTrackEvent = isTrackEvent;
const combined_events_types_1 = require("../types/combined-events.types");
exports.SCORING_COEFFICIENTS = {
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_100M]: { A: 25.4347, B: 18, C: 1.81 },
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_110M_HURDLES]: {
        A: 5.74352,
        B: 28.5,
        C: 1.92,
    },
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_400M]: { A: 1.53775, B: 82, C: 1.81 },
    [combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M]: { A: 0.03768, B: 480, C: 1.85 },
    '100M_WOMEN': { A: 17.857, B: 21, C: 1.81 },
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES]: {
        A: 9.23076,
        B: 26.7,
        C: 1.835,
    },
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_200M]: { A: 4.99087, B: 42.5, C: 1.81 },
    '200M_WOMEN': { A: 4.99087, B: 42.5, C: 1.81 },
    [combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M]: { A: 0.11193, B: 254, C: 1.88 },
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_60M]: { A: 58.015, B: 11.5, C: 1.81 },
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_60M_HURDLES]: {
        A: 20.5173,
        B: 15.5,
        C: 1.835,
    },
    [combined_events_types_1.CombinedEventDiscipline.SPRINT_80M_HURDLES]: { A: 8.0, B: 25.0, C: 1.835 },
    [combined_events_types_1.CombinedEventDiscipline.MIDDLE_600M]: { A: 0.2883, B: 180.0, C: 1.85 },
    [combined_events_types_1.CombinedEventDiscipline.MIDDLE_1000M]: { A: 0.08713, B: 305.5, C: 1.85 },
    [combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP]: { A: 0.8465, B: 75, C: 1.42 },
    [combined_events_types_1.CombinedEventDiscipline.LONG_JUMP]: { A: 0.14354, B: 220, C: 1.4 },
    [combined_events_types_1.CombinedEventDiscipline.POLE_VAULT]: { A: 0.2797, B: 100, C: 1.35 },
    [combined_events_types_1.CombinedEventDiscipline.TRIPLE_JUMP]: { A: 0.03768, B: 480, C: 1.4 },
    [combined_events_types_1.CombinedEventDiscipline.SHOT_PUT]: { A: 51.39, B: 1.5, C: 1.05 },
    [combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW]: { A: 12.91, B: 4, C: 1.1 },
    [combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW]: { A: 10.14, B: 7, C: 1.08 },
    [combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW]: { A: 13.0941, B: 5.5, C: 1.05 },
    [combined_events_types_1.CombinedEventDiscipline.WEIGHT_THROW]: { A: 47.8338, B: 1.5, C: 1.05 },
    SP_WOMEN: { A: 51.39, B: 1.5, C: 1.05 },
    JT_WOMEN: { A: 15.9803, B: 3.8, C: 1.04 },
    HT_WOMEN: { A: 13.3174, B: 5, C: 1.05 },
    WT_WOMEN: { A: 44.2593, B: 1.5, C: 1.05 },
    [combined_events_types_1.CombinedEventDiscipline.SHOT_PUT_3KG]: { A: 51.39, B: 1.5, C: 1.05 },
    [combined_events_types_1.CombinedEventDiscipline.SHOT_PUT_5KG]: { A: 51.39, B: 1.5, C: 1.05 },
};
function getScoringCoefficients(discipline, gender = 'MALE') {
    if (gender === 'FEMALE') {
        switch (discipline) {
            case '100M':
                return exports.SCORING_COEFFICIENTS['100M_WOMEN'];
            case '200M':
                return exports.SCORING_COEFFICIENTS['200M_WOMEN'];
            case 'SP':
                return exports.SCORING_COEFFICIENTS['SP_WOMEN'];
            case 'SP3':
                return exports.SCORING_COEFFICIENTS['SP3'];
            case 'JT':
                return exports.SCORING_COEFFICIENTS['JT_WOMEN'];
            case 'HT':
                return exports.SCORING_COEFFICIENTS['HT_WOMEN'];
            case 'WT':
                return exports.SCORING_COEFFICIENTS['WT_WOMEN'];
            default:
                return exports.SCORING_COEFFICIENTS[discipline] || { A: 0, B: 0, C: 0 };
        }
    }
    else {
        switch (discipline) {
            case 'SP5':
                return exports.SCORING_COEFFICIENTS['SP5'];
            default:
                return exports.SCORING_COEFFICIENTS[discipline] || { A: 0, B: 0, C: 0 };
        }
    }
    return exports.SCORING_COEFFICIENTS[discipline] || { A: 0, B: 0, C: 0 };
}
function parseTimeToSeconds(timeString) {
    if (!timeString || typeof timeString !== 'string') {
        throw new Error('Invalid time string');
    }
    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10);
            const seconds = parseFloat(parts[1]);
            if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
                throw new Error('Invalid time format');
            }
            return minutes * 60 + seconds;
        }
        else {
            throw new Error('Invalid time format - expected MM:SS.ss');
        }
    }
    const seconds = parseFloat(timeString);
    if (isNaN(seconds) || seconds < 0) {
        throw new Error('Invalid time value');
    }
    return seconds;
}
function parseDistanceToMeters(distanceString) {
    if (!distanceString || typeof distanceString !== 'string') {
        throw new Error('Invalid distance string');
    }
    const cleanDistance = distanceString.replace(/[^\d.-]/g, '');
    const distance = parseFloat(cleanDistance);
    if (isNaN(distance)) {
        throw new Error('Invalid distance value');
    }
    return distance;
}
function parseHeightToMeters(heightString) {
    if (!heightString || typeof heightString !== 'string') {
        throw new Error('Invalid height string');
    }
    const cleanHeight = heightString.replace(/[^\d.-]/g, '');
    const height = parseFloat(cleanHeight);
    if (isNaN(height)) {
        throw new Error('Invalid height value');
    }
    if (height > 10) {
        return height / 100;
    }
    return height;
}
function isTrackEvent(discipline) {
    const trackEvents = [
        combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
        combined_events_types_1.CombinedEventDiscipline.SPRINT_110M_HURDLES,
        combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
        combined_events_types_1.CombinedEventDiscipline.SPRINT_400M,
        combined_events_types_1.CombinedEventDiscipline.SPRINT_60M,
        combined_events_types_1.CombinedEventDiscipline.SPRINT_60M_HURDLES,
        combined_events_types_1.CombinedEventDiscipline.SPRINT_80M_HURDLES,
        combined_events_types_1.CombinedEventDiscipline.MIDDLE_600M,
        combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
        combined_events_types_1.CombinedEventDiscipline.MIDDLE_1000M,
        combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
        combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
        '200M',
    ];
    return trackEvents.includes(discipline);
}
//# sourceMappingURL=scoring-tables.js.map