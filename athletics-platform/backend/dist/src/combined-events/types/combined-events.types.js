"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMBINED_EVENT_DISCIPLINES = exports.CombinedEventDiscipline = exports.CombinedEventType = void 0;
var CombinedEventType;
(function (CombinedEventType) {
    CombinedEventType["DECATHLON"] = "DECATHLON";
    CombinedEventType["HEPTATHLON"] = "HEPTATHLON";
    CombinedEventType["PENTATHLON_INDOOR"] = "PENTATHLON_INDOOR";
    CombinedEventType["PENTATHLON_OUTDOOR"] = "PENTATHLON_OUTDOOR";
    CombinedEventType["DECATHLON_MASTERS"] = "DECATHLON_MASTERS";
    CombinedEventType["HEPTATHLON_MASTERS"] = "HEPTATHLON_MASTERS";
    CombinedEventType["PENTATHLON_INDOOR_MASTERS"] = "PENTATHLON_INDOOR_MASTERS";
    CombinedEventType["PENTATHLON_OUTDOOR_MASTERS"] = "PENTATHLON_OUTDOOR_MASTERS";
    CombinedEventType["THROWS_PENTATHLON_MASTERS"] = "THROWS_PENTATHLON_MASTERS";
    CombinedEventType["PENTATHLON_U16_MALE"] = "PENTATHLON_U16_MALE";
    CombinedEventType["PENTATHLON_U16_FEMALE"] = "PENTATHLON_U16_FEMALE";
})(CombinedEventType || (exports.CombinedEventType = CombinedEventType = {}));
var CombinedEventDiscipline;
(function (CombinedEventDiscipline) {
    CombinedEventDiscipline["SPRINT_100M"] = "100M";
    CombinedEventDiscipline["SPRINT_110M_HURDLES"] = "110MH";
    CombinedEventDiscipline["SPRINT_100M_HURDLES"] = "100MH";
    CombinedEventDiscipline["SPRINT_200M"] = "200M";
    CombinedEventDiscipline["SPRINT_400M"] = "400M";
    CombinedEventDiscipline["SPRINT_60M"] = "60M";
    CombinedEventDiscipline["SPRINT_60M_HURDLES"] = "60MH";
    CombinedEventDiscipline["MIDDLE_800M"] = "800M";
    CombinedEventDiscipline["MIDDLE_1000M"] = "1000M";
    CombinedEventDiscipline["MIDDLE_1500M"] = "1500M";
    CombinedEventDiscipline["SPRINT_80M_HURDLES"] = "80MH";
    CombinedEventDiscipline["MIDDLE_600M"] = "600M";
    CombinedEventDiscipline["HIGH_JUMP"] = "HJ";
    CombinedEventDiscipline["LONG_JUMP"] = "LJ";
    CombinedEventDiscipline["POLE_VAULT"] = "PV";
    CombinedEventDiscipline["TRIPLE_JUMP"] = "TJ";
    CombinedEventDiscipline["SHOT_PUT"] = "SP";
    CombinedEventDiscipline["DISCUS_THROW"] = "DT";
    CombinedEventDiscipline["JAVELIN_THROW"] = "JT";
    CombinedEventDiscipline["HAMMER_THROW"] = "HT";
    CombinedEventDiscipline["WEIGHT_THROW"] = "WT";
    CombinedEventDiscipline["SHOT_PUT_3KG"] = "SP3";
    CombinedEventDiscipline["SHOT_PUT_5KG"] = "SP5";
})(CombinedEventDiscipline || (exports.CombinedEventDiscipline = CombinedEventDiscipline = {}));
exports.COMBINED_EVENT_DISCIPLINES = {
    [CombinedEventType.DECATHLON]: [
        CombinedEventDiscipline.SPRINT_100M,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SPRINT_400M,
        CombinedEventDiscipline.SPRINT_110M_HURDLES,
        CombinedEventDiscipline.DISCUS_THROW,
        CombinedEventDiscipline.POLE_VAULT,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.MIDDLE_1500M,
    ],
    [CombinedEventType.HEPTATHLON]: [
        CombinedEventDiscipline.SPRINT_100M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.SPRINT_200M,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.MIDDLE_800M,
    ],
    [CombinedEventType.PENTATHLON_INDOOR]: [
        CombinedEventDiscipline.SPRINT_60M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_800M,
    ],
    [CombinedEventType.PENTATHLON_OUTDOOR]: [
        CombinedEventDiscipline.SPRINT_100M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_800M,
    ],
    [CombinedEventType.DECATHLON_MASTERS]: [
        CombinedEventDiscipline.SPRINT_100M,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SPRINT_400M,
        CombinedEventDiscipline.SPRINT_110M_HURDLES,
        CombinedEventDiscipline.DISCUS_THROW,
        CombinedEventDiscipline.POLE_VAULT,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.MIDDLE_1500M,
    ],
    [CombinedEventType.HEPTATHLON_MASTERS]: [
        CombinedEventDiscipline.SPRINT_100M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.SPRINT_200M,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.MIDDLE_800M,
    ],
    [CombinedEventType.PENTATHLON_INDOOR_MASTERS]: [
        CombinedEventDiscipline.SPRINT_60M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_800M,
    ],
    [CombinedEventType.PENTATHLON_OUTDOOR_MASTERS]: [
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.SPRINT_200M,
        CombinedEventDiscipline.DISCUS_THROW,
        CombinedEventDiscipline.MIDDLE_1500M,
    ],
    [CombinedEventType.THROWS_PENTATHLON_MASTERS]: [
        CombinedEventDiscipline.HAMMER_THROW,
        CombinedEventDiscipline.SHOT_PUT,
        CombinedEventDiscipline.DISCUS_THROW,
        CombinedEventDiscipline.JAVELIN_THROW,
        CombinedEventDiscipline.WEIGHT_THROW,
    ],
    [CombinedEventType.PENTATHLON_U16_MALE]: [
        CombinedEventDiscipline.SPRINT_110M_HURDLES,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.SHOT_PUT_5KG,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.MIDDLE_1000M,
    ],
    [CombinedEventType.PENTATHLON_U16_FEMALE]: [
        CombinedEventDiscipline.SPRINT_80M_HURDLES,
        CombinedEventDiscipline.HIGH_JUMP,
        CombinedEventDiscipline.SHOT_PUT_3KG,
        CombinedEventDiscipline.LONG_JUMP,
        CombinedEventDiscipline.MIDDLE_600M,
    ],
};
//# sourceMappingURL=combined-events.types.js.map