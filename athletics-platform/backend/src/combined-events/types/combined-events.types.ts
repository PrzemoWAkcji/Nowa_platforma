// Typy dla wielobojów

export enum CombinedEventType {
  // Oficjalne wieloboje World Athletics
  DECATHLON = 'DECATHLON', // 10-bój męski (oficjalny)
  HEPTATHLON = 'HEPTATHLON', // 7-bój żeński (oficjalny)
  PENTATHLON_INDOOR = 'PENTATHLON_INDOOR', // 5-bój indoor (oficjalny)
  PENTATHLON_OUTDOOR = 'PENTATHLON_OUTDOOR', // 5-bój outdoor (oficjalny)

  // Wieloboje Masters (WMA) - oznaczone dla rozróżnienia
  DECATHLON_MASTERS = 'DECATHLON_MASTERS', // 10-bój Masters (WMA)
  HEPTATHLON_MASTERS = 'HEPTATHLON_MASTERS', // 7-bój Masters (WMA)
  PENTATHLON_INDOOR_MASTERS = 'PENTATHLON_INDOOR_MASTERS', // 5-bój indoor Masters (WMA)
  PENTATHLON_OUTDOOR_MASTERS = 'PENTATHLON_OUTDOOR_MASTERS', // 5-bój outdoor Masters (WMA)
  THROWS_PENTATHLON_MASTERS = 'THROWS_PENTATHLON_MASTERS', // 5-bój rzutowy Masters (WMA)

  // Niestandardowe wieloboje (lokalne/dodatkowe)
  PENTATHLON_U16_MALE = 'PENTATHLON_U16_MALE', // 5-bój U16 chłopcy (niestandardowy)
  PENTATHLON_U16_FEMALE = 'PENTATHLON_U16_FEMALE', // 5-bój U16 dziewczęta (niestandardowy)
}

export enum CombinedEventDiscipline {
  // Biegi - standardowe
  SPRINT_100M = '100M',
  SPRINT_110M_HURDLES = '110MH',
  SPRINT_100M_HURDLES = '100MH',
  SPRINT_200M = '200M',
  SPRINT_400M = '400M',
  SPRINT_60M = '60M',
  SPRINT_60M_HURDLES = '60MH',
  MIDDLE_800M = '800M',
  MIDDLE_1000M = '1000M',
  MIDDLE_1500M = '1500M',

  // Biegi - niestandardowe (U16)
  SPRINT_80M_HURDLES = '80MH', // 80m przez płotki dla U16 dziewcząt (niestandardowy)
  MIDDLE_600M = '600M', // 600m dla U16 dziewcząt (niestandardowy)

  // Skoki
  HIGH_JUMP = 'HJ',
  LONG_JUMP = 'LJ',
  POLE_VAULT = 'PV',
  TRIPLE_JUMP = 'TJ', // Trójskok (dla Masters)

  // Rzuty - standardowe
  SHOT_PUT = 'SP',
  DISCUS_THROW = 'DT',
  JAVELIN_THROW = 'JT',
  HAMMER_THROW = 'HT', // Młot (dla Masters)
  WEIGHT_THROW = 'WT', // Rzut wagą (dla Masters)

  // Rzuty - niestandardowe (U16)
  SHOT_PUT_3KG = 'SP3', // Kula 3kg dla U16 dziewcząt (niestandardowy)
  SHOT_PUT_5KG = 'SP5', // Kula 5kg dla U16 chłopców (niestandardowy)
}

export interface EventCoefficients {
  A: number; // Współczynnik A
  B: number; // Współczynnik B
  C: number; // Współczynnik C
}

export interface CombinedEventResult {
  discipline: CombinedEventDiscipline;
  performance: string; // "10.50", "7.45", "2:15.30"
  points: number;
  isValid: boolean;
  wind?: string; // Prędkość wiatru dla biegów
}

export interface CombinedEventScore {
  eventType: CombinedEventType;
  results: CombinedEventResult[];
  totalPoints: number;
  isComplete: boolean;
  athleteId: string;
  competitionId: string;
}

// Definicje wielobojów zgodnie z oficjalnymi przepisami World Athletics i WMA
export const COMBINED_EVENT_DISCIPLINES = {
  // === OFICJALNE WIELOBOJE WORLD ATHLETICS ===

  // Dziesięciobój męski (oficjalny World Athletics)
  [CombinedEventType.DECATHLON]: [
    CombinedEventDiscipline.SPRINT_100M, // Dzień 1: 100m
    CombinedEventDiscipline.LONG_JUMP, // Dzień 1: Skok w dal
    CombinedEventDiscipline.SHOT_PUT, // Dzień 1: Pchnięcie kulą
    CombinedEventDiscipline.HIGH_JUMP, // Dzień 1: Skok wzwyż
    CombinedEventDiscipline.SPRINT_400M, // Dzień 1: 400m
    CombinedEventDiscipline.SPRINT_110M_HURDLES, // Dzień 2: 110m przez płotki
    CombinedEventDiscipline.DISCUS_THROW, // Dzień 2: Rzut dyskiem
    CombinedEventDiscipline.POLE_VAULT, // Dzień 2: Skok o tyczce
    CombinedEventDiscipline.JAVELIN_THROW, // Dzień 2: Rzut oszczepem
    CombinedEventDiscipline.MIDDLE_1500M, // Dzień 2: 1500m
  ],

  // Siedmiobój żeński (oficjalny World Athletics)
  [CombinedEventType.HEPTATHLON]: [
    CombinedEventDiscipline.SPRINT_100M_HURDLES, // Dzień 1: 100m przez płotki
    CombinedEventDiscipline.HIGH_JUMP, // Dzień 1: Skok wzwyż
    CombinedEventDiscipline.SHOT_PUT, // Dzień 1: Pchnięcie kulą
    CombinedEventDiscipline.SPRINT_200M, // Dzień 1: 200m
    CombinedEventDiscipline.LONG_JUMP, // Dzień 2: Skok w dal
    CombinedEventDiscipline.JAVELIN_THROW, // Dzień 2: Rzut oszczepem
    CombinedEventDiscipline.MIDDLE_800M, // Dzień 2: 800m
  ],

  // Pięciobój Indoor (oficjalny World Athletics)
  [CombinedEventType.PENTATHLON_INDOOR]: [
    CombinedEventDiscipline.SPRINT_60M_HURDLES, // 60m przez płotki
    CombinedEventDiscipline.HIGH_JUMP, // Skok wzwyż
    CombinedEventDiscipline.SHOT_PUT, // Pchnięcie kulą
    CombinedEventDiscipline.LONG_JUMP, // Skok w dal
    CombinedEventDiscipline.MIDDLE_800M, // 800m
  ],

  // Pięciobój Outdoor (oficjalny World Athletics)
  [CombinedEventType.PENTATHLON_OUTDOOR]: [
    CombinedEventDiscipline.SPRINT_100M_HURDLES, // Płotki krótkie (kobiety)
    CombinedEventDiscipline.HIGH_JUMP, // Skok wzwyż
    CombinedEventDiscipline.SHOT_PUT, // Pchnięcie kulą
    CombinedEventDiscipline.LONG_JUMP, // Skok w dal
    CombinedEventDiscipline.MIDDLE_800M, // 800m
  ],

  // === WIELOBOJE MASTERS (WMA) ===

  // Dziesięciobój Masters męski (WMA)
  [CombinedEventType.DECATHLON_MASTERS]: [
    CombinedEventDiscipline.SPRINT_100M, // Dzień 1: 100m
    CombinedEventDiscipline.LONG_JUMP, // Dzień 1: Skok w dal
    CombinedEventDiscipline.SHOT_PUT, // Dzień 1: Pchnięcie kulą
    CombinedEventDiscipline.HIGH_JUMP, // Dzień 1: Skok wzwyż
    CombinedEventDiscipline.SPRINT_400M, // Dzień 1: 400m
    CombinedEventDiscipline.SPRINT_110M_HURDLES, // Dzień 2: Płotki krótkie
    CombinedEventDiscipline.DISCUS_THROW, // Dzień 2: Rzut dyskiem
    CombinedEventDiscipline.POLE_VAULT, // Dzień 2: Skok o tyczce
    CombinedEventDiscipline.JAVELIN_THROW, // Dzień 2: Rzut oszczepem
    CombinedEventDiscipline.MIDDLE_1500M, // Dzień 2: 1500m
  ],

  // Siedmiobój Masters żeński (WMA)
  [CombinedEventType.HEPTATHLON_MASTERS]: [
    CombinedEventDiscipline.SPRINT_100M_HURDLES, // Dzień 1: 100m przez płotki
    CombinedEventDiscipline.HIGH_JUMP, // Dzień 1: Skok wzwyż
    CombinedEventDiscipline.SHOT_PUT, // Dzień 1: Pchnięcie kulą
    CombinedEventDiscipline.SPRINT_200M, // Dzień 1: 200m
    CombinedEventDiscipline.LONG_JUMP, // Dzień 2: Skok w dal
    CombinedEventDiscipline.JAVELIN_THROW, // Dzień 2: Rzut oszczepem
    CombinedEventDiscipline.MIDDLE_800M, // Dzień 2: 800m
  ],

  // Pięciobój Indoor Masters (WMA)
  [CombinedEventType.PENTATHLON_INDOOR_MASTERS]: [
    CombinedEventDiscipline.SPRINT_60M_HURDLES, // 60m przez płotki
    CombinedEventDiscipline.HIGH_JUMP, // Skok wzwyż
    CombinedEventDiscipline.SHOT_PUT, // Pchnięcie kulą
    CombinedEventDiscipline.LONG_JUMP, // Skok w dal
    CombinedEventDiscipline.MIDDLE_800M, // 800m
  ],

  // Pięciobój Outdoor Masters (WMA) - różne dla mężczyzn i kobiet
  [CombinedEventType.PENTATHLON_OUTDOOR_MASTERS]: [
    // Mężczyźni: skok w dal, rzut oszczepem, 200m, rzut dyskiem, 1500m
    // Kobiety: płotki krótkie, skok wzwyż, pchnięcie kulą, skok w dal, 800m
    CombinedEventDiscipline.LONG_JUMP, // Skok w dal (M) / Płotki krótkie (K)
    CombinedEventDiscipline.JAVELIN_THROW, // Rzut oszczepem (M) / Skok wzwyż (K)
    CombinedEventDiscipline.SPRINT_200M, // 200m (M) / Pchnięcie kulą (K)
    CombinedEventDiscipline.DISCUS_THROW, // Rzut dyskiem (M) / Skok w dal (K)
    CombinedEventDiscipline.MIDDLE_1500M, // 1500m (M) / 800m (K)
  ],

  // Pięciobój Rzutowy Masters (WMA)
  [CombinedEventType.THROWS_PENTATHLON_MASTERS]: [
    CombinedEventDiscipline.HAMMER_THROW, // Rzut młotem
    CombinedEventDiscipline.SHOT_PUT, // Pchnięcie kulą
    CombinedEventDiscipline.DISCUS_THROW, // Rzut dyskiem
    CombinedEventDiscipline.JAVELIN_THROW, // Rzut oszczepem
    CombinedEventDiscipline.WEIGHT_THROW, // Rzut wagą
  ],

  // === NIESTANDARDOWE WIELOBOJE (LOKALNE) ===

  // Pięciobój U16 chłopcy (niestandardowy)
  [CombinedEventType.PENTATHLON_U16_MALE]: [
    CombinedEventDiscipline.SPRINT_110M_HURDLES, // 110m przez płotki
    CombinedEventDiscipline.LONG_JUMP, // Skok w dal
    CombinedEventDiscipline.SHOT_PUT_5KG, // Kula 5kg
    CombinedEventDiscipline.HIGH_JUMP, // Skok wzwyż
    CombinedEventDiscipline.MIDDLE_1000M, // 1000m
  ],

  // Pięciobój U16 dziewczęta (niestandardowy)
  [CombinedEventType.PENTATHLON_U16_FEMALE]: [
    CombinedEventDiscipline.SPRINT_80M_HURDLES, // 80m przez płotki
    CombinedEventDiscipline.HIGH_JUMP, // Skok wzwyż
    CombinedEventDiscipline.SHOT_PUT_3KG, // Kula 3kg
    CombinedEventDiscipline.LONG_JUMP, // Skok w dal
    CombinedEventDiscipline.MIDDLE_600M, // 600m
  ],
};
