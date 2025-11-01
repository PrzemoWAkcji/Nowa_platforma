import {
  EventCoefficients,
  CombinedEventDiscipline,
} from '../types/combined-events.types';

// Oficjalne współczynniki IAAF/World Athletics dla formuły punktacji wielobojów
// Formuła: Points = A * (B - T)^C dla biegów
// Formuła: Points = A * (M - B)^C dla skoków i rzutów
// gdzie T = czas w sekundach, M = wynik w metrach

export const SCORING_COEFFICIENTS: Record<string, EventCoefficients> = {
  // BIEGI (Track events) - męskie
  [CombinedEventDiscipline.SPRINT_100M]: { A: 25.4347, B: 18, C: 1.81 },
  [CombinedEventDiscipline.SPRINT_110M_HURDLES]: {
    A: 5.74352,
    B: 28.5,
    C: 1.92,
  },
  [CombinedEventDiscipline.SPRINT_400M]: { A: 1.53775, B: 82, C: 1.81 },
  [CombinedEventDiscipline.MIDDLE_1500M]: { A: 0.03768, B: 480, C: 1.85 },

  // BIEGI - żeńskie
  '100M_WOMEN': { A: 17.857, B: 21, C: 1.81 },
  [CombinedEventDiscipline.SPRINT_100M_HURDLES]: {
    A: 9.23076,
    B: 26.7,
    C: 1.835,
  },
  [CombinedEventDiscipline.SPRINT_200M]: { A: 4.99087, B: 42.5, C: 1.81 },
  '200M_WOMEN': { A: 4.99087, B: 42.5, C: 1.81 },
  [CombinedEventDiscipline.MIDDLE_800M]: { A: 0.11193, B: 254, C: 1.88 },

  // BIEGI - indoor
  [CombinedEventDiscipline.SPRINT_60M]: { A: 58.015, B: 11.5, C: 1.81 },
  [CombinedEventDiscipline.SPRINT_60M_HURDLES]: {
    A: 20.5173,
    B: 15.5,
    C: 1.835,
  },

  // BIEGI - młodzież U16
  [CombinedEventDiscipline.SPRINT_80M_HURDLES]: { A: 8.0, B: 25.0, C: 1.835 }, // 80m przez płotki U16 dziewczęta
  [CombinedEventDiscipline.MIDDLE_600M]: { A: 0.2883, B: 180.0, C: 1.85 }, // 600m U16 dziewczęta
  [CombinedEventDiscipline.MIDDLE_1000M]: { A: 0.08713, B: 305.5, C: 1.85 }, // 1000m U16 chłopcy

  // SKOKI (Field events - jumps) - wartości B w centymetrach
  [CombinedEventDiscipline.HIGH_JUMP]: { A: 0.8465, B: 75, C: 1.42 },
  [CombinedEventDiscipline.LONG_JUMP]: { A: 0.14354, B: 220, C: 1.4 },
  [CombinedEventDiscipline.POLE_VAULT]: { A: 0.2797, B: 100, C: 1.35 },
  [CombinedEventDiscipline.TRIPLE_JUMP]: { A: 0.03768, B: 480, C: 1.4 }, // Trójskok

  // RZUTY (Field events - throws) - męskie
  [CombinedEventDiscipline.SHOT_PUT]: { A: 51.39, B: 1.5, C: 1.05 },
  [CombinedEventDiscipline.DISCUS_THROW]: { A: 12.91, B: 4, C: 1.1 },
  [CombinedEventDiscipline.JAVELIN_THROW]: { A: 10.14, B: 7, C: 1.08 },
  [CombinedEventDiscipline.HAMMER_THROW]: { A: 13.0941, B: 5.5, C: 1.05 }, // Młot (oficjalne WMA)
  [CombinedEventDiscipline.WEIGHT_THROW]: { A: 47.8338, B: 1.5, C: 1.05 }, // Waga (oficjalne WMA)

  // RZUTY - żeńskie
  SP_WOMEN: { A: 51.39, B: 1.5, C: 1.05 }, // Shot put - te same współczynniki
  JT_WOMEN: { A: 15.9803, B: 3.8, C: 1.04 }, // Javelin - różne współczynniki
  HT_WOMEN: { A: 13.3174, B: 5, C: 1.05 }, // Młot kobiety (oficjalne WMA)
  WT_WOMEN: { A: 44.2593, B: 1.5, C: 1.05 }, // Waga kobiety (oficjalne WMA)

  // RZUTY - U16
  [CombinedEventDiscipline.SHOT_PUT_3KG]: { A: 51.39, B: 1.5, C: 1.05 }, // Kula 3kg U16 dziewczęta
  [CombinedEventDiscipline.SHOT_PUT_5KG]: { A: 51.39, B: 1.5, C: 1.05 }, // Kula 5kg U16 chłopcy
};

// Mapowanie dyscyplin na współczynniki z uwzględnieniem płci
export function getScoringCoefficients(
  discipline: string,
  gender: 'MALE' | 'FEMALE' = 'MALE',
): EventCoefficients {
  // Specjalne przypadki dla kobiet
  if (gender === 'FEMALE') {
    switch (discipline) {
      case '100M':
        return SCORING_COEFFICIENTS['100M_WOMEN'];
      case '200M':
        return SCORING_COEFFICIENTS['200M_WOMEN'];
      case 'SP':
        return SCORING_COEFFICIENTS['SP_WOMEN'];
      case 'SP3':
        return SCORING_COEFFICIENTS['SP3'];
      case 'JT':
        return SCORING_COEFFICIENTS['JT_WOMEN'];
      case 'HT':
        return SCORING_COEFFICIENTS['HT_WOMEN'];
      case 'WT':
        return SCORING_COEFFICIENTS['WT_WOMEN'];
      default:
        return SCORING_COEFFICIENTS[discipline] || { A: 0, B: 0, C: 0 };
    }
  } else {
    // Specjalne przypadki dla mężczyzn
    switch (discipline) {
      case 'SP5':
        return SCORING_COEFFICIENTS['SP5'];
      default:
        return SCORING_COEFFICIENTS[discipline] || { A: 0, B: 0, C: 0 };
    }
  }

  return SCORING_COEFFICIENTS[discipline] || { A: 0, B: 0, C: 0 };
}

// Funkcje pomocnicze do konwersji wyników
export function parseTimeToSeconds(timeString: string): number {
  // Obsługuje formaty: "10.50", "1:15.30", "2:15.30"
  if (!timeString || typeof timeString !== 'string') {
    throw new Error('Invalid time string');
  }

  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      // Format MM:SS.ss
      const minutes = parseInt(parts[0], 10);
      const seconds = parseFloat(parts[1]);
      
      if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
        throw new Error('Invalid time format');
      }
      
      return minutes * 60 + seconds;
    } else {
      throw new Error('Invalid time format - expected MM:SS.ss');
    }
  }
  
  const seconds = parseFloat(timeString);
  if (isNaN(seconds) || seconds < 0) {
    throw new Error('Invalid time value');
  }
  
  return seconds;
}

export function parseDistanceToMeters(distanceString: string): number {
  // Usuwa jednostki i konwertuje na metry, ale zachowuje znak minus
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

export function parseHeightToMeters(heightString: string): number {
  // Obsługuje formaty: "2.15", "2.15m", "215" (cm), ale zachowuje znak minus
  if (!heightString || typeof heightString !== 'string') {
    throw new Error('Invalid height string');
  }
  
  const cleanHeight = heightString.replace(/[^\d.-]/g, '');
  const height = parseFloat(cleanHeight);

  if (isNaN(height)) {
    throw new Error('Invalid height value');
  }

  // Jeśli wartość > 10, prawdopodobnie w centymetrach
  if (height > 10) {
    return height / 100;
  }
  return height;
}

// Funkcja do określenia czy dyscyplina to bieg (track) czy skok/rzut (field)
export function isTrackEvent(discipline: string): boolean {
  const trackEvents = [
    CombinedEventDiscipline.SPRINT_100M,
    CombinedEventDiscipline.SPRINT_110M_HURDLES,
    CombinedEventDiscipline.SPRINT_100M_HURDLES,
    CombinedEventDiscipline.SPRINT_400M,
    CombinedEventDiscipline.SPRINT_60M,
    CombinedEventDiscipline.SPRINT_60M_HURDLES,
    CombinedEventDiscipline.SPRINT_80M_HURDLES,
    CombinedEventDiscipline.MIDDLE_600M,
    CombinedEventDiscipline.MIDDLE_800M,
    CombinedEventDiscipline.MIDDLE_1000M,
    CombinedEventDiscipline.MIDDLE_1500M,
    CombinedEventDiscipline.SPRINT_200M,
    '200M', // Dodatkowy alias dla 200m
  ];

  return trackEvents.includes(discipline as CombinedEventDiscipline);
}
