"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PENTATHLON_U16_FEMALE_EXAMPLE = exports.PENTATHLON_U16_MALE_EXAMPLE = exports.THROWS_PENTATHLON_MASTERS_EXAMPLE = exports.PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE = exports.PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE = exports.HEPTATHLON_MASTERS_W45_EXAMPLE = exports.DECATHLON_MASTERS_M50_EXAMPLE = exports.PENTATHLON_OUTDOOR_EXAMPLE = exports.PENTATHLON_INDOOR_EXAMPLE = exports.HEPTATHLON_EXAMPLE = exports.DECATHLON_EXAMPLE = void 0;
exports.getExampleForEventType = getExampleForEventType;
exports.getAllMastersExamples = getAllMastersExamples;
exports.getAllOfficialExamples = getAllOfficialExamples;
exports.getAllCustomExamples = getAllCustomExamples;
const combined_events_types_1 = require("../types/combined-events.types");
exports.DECATHLON_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.DECATHLON,
    athleteId: 'athlete-decathlon-001',
    competitionId: 'comp-wa-2024',
    gender: 'MALE',
    ageGroup: 'Senior',
    note: 'Oficjalny dziesięciobój World Athletics',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
            performance: '10.85',
            wind: '+1.2',
            expectedPoints: 856,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '7.45',
            wind: '+0.8',
            expectedPoints: 892,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '15.20',
            expectedPoints: 812,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '2.05',
            expectedPoints: 825,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_400M,
            performance: '48.15',
            expectedPoints: 871,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_110M_HURDLES,
            performance: '14.25',
            wind: '+0.5',
            expectedPoints: 901,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
            performance: '45.80',
            expectedPoints: 789,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.POLE_VAULT,
            performance: '4.80',
            expectedPoints: 845,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
            performance: '62.50',
            expectedPoints: 798,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
            performance: '4:25.30',
            expectedPoints: 756,
        },
    ],
    expectedTotalPoints: 8345,
};
exports.HEPTATHLON_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.HEPTATHLON,
    athleteId: 'athlete-heptathlon-001',
    competitionId: 'comp-wa-2024',
    gender: 'FEMALE',
    ageGroup: 'Senior',
    note: 'Oficjalny siedmiobój World Athletics',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
            performance: '13.15',
            wind: '+1.0',
            expectedPoints: 1089,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.85',
            expectedPoints: 1054,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '14.50',
            expectedPoints: 825,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
            performance: '23.85',
            wind: '+0.3',
            expectedPoints: 1021,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '6.25',
            wind: '+1.5',
            expectedPoints: 967,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
            performance: '48.20',
            expectedPoints: 812,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            performance: '2:08.50',
            expectedPoints: 978,
        },
    ],
    expectedTotalPoints: 6746,
};
exports.PENTATHLON_INDOOR_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR,
    athleteId: 'athlete-indoor-001',
    competitionId: 'comp-indoor-2024',
    gender: 'FEMALE',
    ageGroup: 'Senior',
    note: 'Oficjalny pięciobój indoor World Athletics',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_60M_HURDLES,
            performance: '8.15',
            expectedPoints: 1045,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.75',
            expectedPoints: 925,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '13.80',
            expectedPoints: 785,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '6.05',
            expectedPoints: 912,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            performance: '2:12.30',
            expectedPoints: 945,
        },
    ],
    expectedTotalPoints: 4612,
};
exports.PENTATHLON_OUTDOOR_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR,
    athleteId: 'athlete-outdoor-001',
    competitionId: 'comp-outdoor-2024',
    gender: 'FEMALE',
    ageGroup: 'Senior',
    note: 'Oficjalny pięciobój outdoor World Athletics',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
            performance: '13.45',
            wind: '+0.8',
            expectedPoints: 1056,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.80',
            expectedPoints: 985,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '13.20',
            expectedPoints: 745,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '5.95',
            wind: '+1.2',
            expectedPoints: 885,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            performance: '2:15.80',
            expectedPoints: 912,
        },
    ],
    expectedTotalPoints: 4583,
};
exports.DECATHLON_MASTERS_M50_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.DECATHLON_MASTERS,
    athleteId: 'athlete-masters-m50-001',
    competitionId: 'comp-masters-2024',
    gender: 'MALE',
    ageGroup: 'M50',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M,
            performance: '11.85',
            wind: '+0.9',
            expectedPoints: 756,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '6.85',
            wind: '+0.5',
            expectedPoints: 812,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '13.20',
            expectedPoints: 698,
            note: 'Kula 6kg dla M50+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.85',
            expectedPoints: 745,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_400M,
            performance: '52.30',
            expectedPoints: 798,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_110M_HURDLES,
            performance: '15.85',
            wind: '+0.2',
            expectedPoints: 812,
            note: 'Płotki 0.914m dla M50+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
            performance: '38.50',
            expectedPoints: 685,
            note: 'Dysk 1.5kg dla M50+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.POLE_VAULT,
            performance: '4.20',
            expectedPoints: 765,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
            performance: '48.30',
            expectedPoints: 612,
            note: 'Oszczep 700g dla M50+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
            performance: '4:58.20',
            expectedPoints: 698,
        },
    ],
    expectedTotalPoints: 7381,
};
exports.HEPTATHLON_MASTERS_W45_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.HEPTATHLON_MASTERS,
    athleteId: 'athlete-masters-w45-001',
    competitionId: 'comp-masters-2024',
    gender: 'FEMALE',
    ageGroup: 'W45',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
            performance: '14.25',
            wind: '+0.7',
            expectedPoints: 985,
            note: 'Płotki 0.762m dla W45+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.65',
            expectedPoints: 856,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '11.80',
            expectedPoints: 698,
            note: 'Kula 4kg dla W35+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
            performance: '26.15',
            wind: '-0.2',
            expectedPoints: 912,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '5.45',
            wind: '+1.1',
            expectedPoints: 798,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
            performance: '38.20',
            expectedPoints: 645,
            note: 'Oszczep 600g dla W35+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            performance: '2:28.50',
            expectedPoints: 856,
        },
    ],
    expectedTotalPoints: 5750,
};
exports.PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
    athleteId: 'athlete-masters-m40-001',
    competitionId: 'comp-masters-2024',
    gender: 'MALE',
    ageGroup: 'M40',
    note: 'Pięciobój Outdoor Masters dla mężczyzn ma inne dyscypliny niż dla kobiet',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '6.95',
            wind: '+0.8',
            expectedPoints: 825,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
            performance: '52.30',
            expectedPoints: 698,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_200M,
            performance: '23.85',
            wind: '+0.5',
            expectedPoints: 856,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
            performance: '42.50',
            expectedPoints: 745,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_1500M,
            performance: '4:35.20',
            expectedPoints: 712,
        },
    ],
    expectedTotalPoints: 3836,
};
exports.PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS,
    athleteId: 'athlete-masters-w40-001',
    competitionId: 'comp-masters-2024',
    gender: 'FEMALE',
    ageGroup: 'W40',
    note: 'Pięciobój Outdoor Masters dla kobiet ma inne dyscypliny niż dla mężczyzn',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_100M_HURDLES,
            performance: '14.85',
            wind: '+0.3',
            expectedPoints: 945,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.60',
            expectedPoints: 798,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '10.50',
            expectedPoints: 612,
            note: 'Kula 4kg dla W35+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '5.25',
            wind: '+1.0',
            expectedPoints: 756,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_800M,
            performance: '2:35.80',
            expectedPoints: 798,
        },
    ],
    expectedTotalPoints: 3909,
};
exports.THROWS_PENTATHLON_MASTERS_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS,
    athleteId: 'athlete-masters-throws-001',
    competitionId: 'comp-masters-2024',
    gender: 'MALE',
    ageGroup: 'M55',
    note: 'Pięciobój rzutowy - tylko konkurencje rzutowe',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HAMMER_THROW,
            performance: '45.20',
            expectedPoints: 756,
            note: 'Młot 6kg dla M55+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT,
            performance: '12.80',
            expectedPoints: 698,
            note: 'Kula 6kg dla M55+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.DISCUS_THROW,
            performance: '38.50',
            expectedPoints: 685,
            note: 'Dysk 1.5kg dla M55+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.JAVELIN_THROW,
            performance: '42.30',
            expectedPoints: 612,
            note: 'Oszczep 700g dla M55+',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.WEIGHT_THROW,
            performance: '15.80',
            expectedPoints: 745,
            note: 'Waga 15.88kg dla M55+',
        },
    ],
    expectedTotalPoints: 3496,
};
exports.PENTATHLON_U16_MALE_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.PENTATHLON_U16_MALE,
    athleteId: 'athlete-u16-male-001',
    competitionId: 'comp-youth-2024',
    gender: 'MALE',
    ageGroup: 'U16',
    note: 'Niestandardowy pięciobój dla chłopców U16',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_110M_HURDLES,
            performance: '15.85',
            wind: '+0.8',
            expectedPoints: 756,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '6.25',
            wind: '+1.2',
            expectedPoints: 698,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT_5KG,
            performance: '12.50',
            expectedPoints: 645,
            note: 'Kula 5kg dla U16 chłopców',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.75',
            expectedPoints: 612,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_1000M,
            performance: '2:58.30',
            expectedPoints: 698,
        },
    ],
    expectedTotalPoints: 3409,
};
exports.PENTATHLON_U16_FEMALE_EXAMPLE = {
    eventType: combined_events_types_1.CombinedEventType.PENTATHLON_U16_FEMALE,
    athleteId: 'athlete-u16-female-001',
    competitionId: 'comp-youth-2024',
    gender: 'FEMALE',
    ageGroup: 'U16',
    note: 'Niestandardowy pięciobój dla dziewcząt U16',
    sampleResults: [
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SPRINT_80M_HURDLES,
            performance: '12.85',
            wind: '+0.5',
            expectedPoints: 798,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.HIGH_JUMP,
            performance: '1.55',
            expectedPoints: 685,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.SHOT_PUT_3KG,
            performance: '11.20',
            expectedPoints: 612,
            note: 'Kula 3kg dla U16 dziewcząt',
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.LONG_JUMP,
            performance: '5.15',
            wind: '+0.9',
            expectedPoints: 698,
        },
        {
            discipline: combined_events_types_1.CombinedEventDiscipline.MIDDLE_600M,
            performance: '1:38.50',
            expectedPoints: 756,
        },
    ],
    expectedTotalPoints: 3549,
};
function getExampleForEventType(eventType, gender = 'MALE') {
    switch (eventType) {
        case combined_events_types_1.CombinedEventType.DECATHLON:
            return exports.DECATHLON_EXAMPLE;
        case combined_events_types_1.CombinedEventType.HEPTATHLON:
            return exports.HEPTATHLON_EXAMPLE;
        case combined_events_types_1.CombinedEventType.PENTATHLON_INDOOR:
            return exports.PENTATHLON_INDOOR_EXAMPLE;
        case combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR:
            return exports.PENTATHLON_OUTDOOR_EXAMPLE;
        case combined_events_types_1.CombinedEventType.DECATHLON_MASTERS:
            return exports.DECATHLON_MASTERS_M50_EXAMPLE;
        case combined_events_types_1.CombinedEventType.HEPTATHLON_MASTERS:
            return exports.HEPTATHLON_MASTERS_W45_EXAMPLE;
        case combined_events_types_1.CombinedEventType.PENTATHLON_OUTDOOR_MASTERS:
            return gender === 'MALE'
                ? exports.PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE
                : exports.PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE;
        case combined_events_types_1.CombinedEventType.THROWS_PENTATHLON_MASTERS:
            return exports.THROWS_PENTATHLON_MASTERS_EXAMPLE;
        case combined_events_types_1.CombinedEventType.PENTATHLON_U16_MALE:
            return exports.PENTATHLON_U16_MALE_EXAMPLE;
        case combined_events_types_1.CombinedEventType.PENTATHLON_U16_FEMALE:
            return exports.PENTATHLON_U16_FEMALE_EXAMPLE;
        default:
            throw new Error(`Brak przykładu dla typu wieloboju: ${eventType}`);
    }
}
function getAllMastersExamples() {
    return [
        exports.DECATHLON_MASTERS_M50_EXAMPLE,
        exports.HEPTATHLON_MASTERS_W45_EXAMPLE,
        exports.PENTATHLON_OUTDOOR_MASTERS_MALE_EXAMPLE,
        exports.PENTATHLON_OUTDOOR_MASTERS_FEMALE_EXAMPLE,
        exports.THROWS_PENTATHLON_MASTERS_EXAMPLE,
    ];
}
function getAllOfficialExamples() {
    return [
        exports.DECATHLON_EXAMPLE,
        exports.HEPTATHLON_EXAMPLE,
        exports.PENTATHLON_INDOOR_EXAMPLE,
        exports.PENTATHLON_OUTDOOR_EXAMPLE,
    ];
}
function getAllCustomExamples() {
    return [exports.PENTATHLON_U16_MALE_EXAMPLE, exports.PENTATHLON_U16_FEMALE_EXAMPLE];
}
//# sourceMappingURL=official-combined-events-examples.js.map