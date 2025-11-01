// Przykładowe dane dla wielobojów

export const SAMPLE_DECATHLON_RESULTS = {
  // Przykład bardzo dobrego 10-boju (około 8500 punktów)
  excellent: {
    '100M': '10.50', // ~1000 pkt
    LJ: '7.45', // ~900 pkt
    SP: '15.50', // ~850 pkt
    HJ: '2.15', // ~900 pkt
    '400M': '47.50', // ~950 pkt
    '110MH': '13.80', // ~950 pkt
    DT: '48.00', // ~850 pkt
    PV: '5.20', // ~950 pkt
    JT: '65.00', // ~850 pkt
    '1500M': '4:15.30', // ~800 pkt
  },

  // Przykład dobrego 10-boju (około 7500 punktów)
  good: {
    '100M': '11.00', // ~900 pkt
    LJ: '7.00', // ~800 pkt
    SP: '14.00', // ~750 pkt
    HJ: '2.00', // ~800 pkt
    '400M': '49.00', // ~850 pkt
    '110MH': '14.50', // ~850 pkt
    DT: '42.00', // ~750 pkt
    PV: '4.80', // ~850 pkt
    JT: '58.00', // ~750 pkt
    '1500M': '4:30.00', // ~750 pkt
  },

  // Przykład przeciętnego 10-boju (około 6500 punktów)
  average: {
    '100M': '11.50', // ~800 pkt
    LJ: '6.50', // ~700 pkt
    SP: '12.50', // ~650 pkt
    HJ: '1.85', // ~700 pkt
    '400M': '51.00', // ~750 pkt
    '110MH': '15.50', // ~700 pkt
    DT: '38.00', // ~650 pkt
    PV: '4.40', // ~750 pkt
    JT: '52.00', // ~650 pkt
    '1500M': '4:45.00', // ~650 pkt
  },
};

export const SAMPLE_HEPTATHLON_RESULTS = {
  // Przykład bardzo dobrego 7-boju (około 6500 punktów)
  excellent: {
    '100MH': '13.00', // ~1100 pkt
    HJ: '1.85', // ~1000 pkt
    SP: '15.00', // ~850 pkt
    '200M': '23.50', // ~1000 pkt
    LJ: '6.50', // ~950 pkt
    JT: '50.00', // ~850 pkt
    '800M': '2:10.00', // ~950 pkt
  },

  // Przykład dobrego 7-boju (około 5800 punktów)
  good: {
    '100MH': '13.50', // ~1000 pkt
    HJ: '1.75', // ~900 pkt
    SP: '13.50', // ~750 pkt
    '200M': '24.50', // ~900 pkt
    LJ: '6.20', // ~850 pkt
    JT: '45.00', // ~750 pkt
    '800M': '2:15.00', // ~850 pkt
  },

  // Przykład przeciętnego 7-boju (około 5000 punktów)
  average: {
    '100MH': '14.50', // ~850 pkt
    HJ: '1.65', // ~750 pkt
    SP: '12.00', // ~650 pkt
    '200M': '25.50', // ~750 pkt
    LJ: '5.80', // ~750 pkt
    JT: '40.00', // ~650 pkt
    '800M': '2:20.00', // ~750 pkt
  },
};

export const SAMPLE_PENTATHLON_RESULTS = {
  // Przykład bardzo dobrego 5-boju (około 4500 punktów)
  excellent: {
    '60MH': '8.00', // ~1100 pkt
    HJ: '1.85', // ~1000 pkt
    SP: '15.00', // ~850 pkt
    LJ: '6.50', // ~950 pkt
    '800M': '2:10.00', // ~950 pkt
  },

  // Przykład dobrego 5-boju (około 4000 punktów)
  good: {
    '60MH': '8.50', // ~950 pkt
    HJ: '1.75', // ~900 pkt
    SP: '13.50', // ~750 pkt
    LJ: '6.20', // ~850 pkt
    '800M': '2:15.00', // ~850 pkt
  },

  // Przykład przeciętnego 5-boju (około 3500 punktów)
  average: {
    '60MH': '9.00', // ~800 pkt
    HJ: '1.65', // ~750 pkt
    SP: '12.00', // ~650 pkt
    LJ: '5.80', // ~750 pkt
    '800M': '2:20.00', // ~750 pkt
  },
};

export const SAMPLE_PENTATHLON_U16_MALE_RESULTS = {
  // Przykład bardzo dobrego 5-boju U16 chłopcy (około 4000 punktów)
  excellent: {
    '110MH': '14.00', // ~950 pkt
    LJ: '6.50', // ~700 pkt
    SP5: '14.50', // ~750 pkt
    HJ: '1.90', // ~720 pkt
    '1000M': '2:45.00', // ~880 pkt
  },

  // Przykład dobrego 5-boju U16 chłopcy (około 3600 punktów)
  good: {
    '110MH': '14.50', // ~850 pkt
    LJ: '6.20', // ~630 pkt
    SP5: '13.50', // ~680 pkt
    HJ: '1.85', // ~670 pkt
    '1000M': '2:50.00', // ~770 pkt
  },

  // Przykład przeciętnego 5-boju U16 chłopcy (około 3200 punktów)
  average: {
    '110MH': '15.00', // ~750 pkt
    LJ: '5.90', // ~580 pkt
    SP5: '12.50', // ~600 pkt
    HJ: '1.75', // ~600 pkt
    '1000M': '2:55.00', // ~670 pkt
  },
};

export const SAMPLE_PENTATHLON_U16_FEMALE_RESULTS = {
  // Przykład bardzo dobrego 5-boju U16 dziewczęta (około 3800 punktów)
  excellent: {
    '80MH': '11.50', // ~950 pkt
    HJ: '1.75', // ~600 pkt
    SP3: '12.00', // ~650 pkt
    LJ: '5.90', // ~580 pkt
    '600M': '1:32.00', // ~1020 pkt
  },

  // Przykład dobrego 5-boju U16 dziewczęta (około 3400 punktów)
  good: {
    '80MH': '12.00', // ~850 pkt
    HJ: '1.70', // ~570 pkt
    SP3: '11.50', // ~600 pkt
    LJ: '5.80', // ~560 pkt
    '600M': '1:35.00', // ~820 pkt
  },

  // Przykład przeciętnego 5-boju U16 dziewczęta (około 3000 punktów)
  average: {
    '80MH': '12.50', // ~750 pkt
    HJ: '1.65', // ~530 pkt
    SP3: '10.50', // ~520 pkt
    LJ: '5.60', // ~530 pkt
    '600M': '1:40.00', // ~670 pkt
  },
};

// Funkcja do generowania przykładowych danych
export function generateSampleCombinedEvent(
  eventType:
    | 'DECATHLON'
    | 'HEPTATHLON'
    | 'PENTATHLON'
    | 'PENTATHLON_U16_MALE'
    | 'PENTATHLON_U16_FEMALE',
  level: 'excellent' | 'good' | 'average' = 'good',
) {
  switch (eventType) {
    case 'DECATHLON':
      return SAMPLE_DECATHLON_RESULTS[level];
    case 'HEPTATHLON':
      return SAMPLE_HEPTATHLON_RESULTS[level];
    case 'PENTATHLON_U16_MALE':
      return SAMPLE_PENTATHLON_U16_MALE_RESULTS[level];
    case 'PENTATHLON_U16_FEMALE':
      return SAMPLE_PENTATHLON_U16_FEMALE_RESULTS[level];
    case 'PENTATHLON':
      return SAMPLE_PENTATHLON_RESULTS[level];
    default:
      throw new Error(`Unknown event type: ${String(eventType)}`);
  }
}

// Rekordy świata dla porównania
export const WORLD_RECORDS = {
  DECATHLON: {
    points: 9126, // Kevin Mayer (2018)
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
    points: 7291, // Jackie Joyner-Kersee (1988)
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
