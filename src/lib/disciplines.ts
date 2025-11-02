import { EventType, Unit } from '@/types';

export interface Discipline {
  id: string;
  name: string;
  type: EventType;
  unit: Unit;
  category: 'BIEGI' | 'SKOKI' | 'RZUTY' | 'WIELOBOJE';
  distance?: string;
  isRelay?: boolean;
}

export const DISCIPLINES: Record<string, Discipline[]> = {
  BIEGI: [
    // Biegi sprinterskie
    { id: '100m', name: '100m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '100m' },
    { id: '200m', name: '200m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '200m' },
    { id: '400m', name: '400m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '400m' },
    
    // Biegi średnie
    { id: '800m', name: '800m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '800m' },
    { id: '1500m', name: '1500m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '1500m' },
    { id: '3000m', name: '3000m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '3000m' },
    { id: '5000m', name: '5000m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '5000m' },
    { id: '10000m', name: '10000m', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '10000m' },
    
    // Biegi przez płotki
    { id: '110m_hurdles', name: '110m przez płotki', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '110m' },
    { id: '100m_hurdles', name: '100m przez płotki', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '100m' },
    { id: '400m_hurdles', name: '400m przez płotki', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '400m' },
    
    // Biegi z przeszkodami
    { id: '3000m_steeplechase', name: '3000m z przeszkodami', type: EventType.TRACK, unit: Unit.TIME, category: 'BIEGI', distance: '3000m' },
    
    // Biegi długie (szosa)
    { id: 'half_marathon', name: 'Półmaraton', type: EventType.ROAD, unit: Unit.TIME, category: 'BIEGI', distance: '21.0975km' },
    { id: 'marathon', name: 'Maraton', type: EventType.ROAD, unit: Unit.TIME, category: 'BIEGI', distance: '42.195km' },
    { id: '10km_road', name: '10km (szosa)', type: EventType.ROAD, unit: Unit.TIME, category: 'BIEGI', distance: '10km' },
    
    // Sztafety
    { id: '4x100m', name: '4x100m', type: EventType.RELAY, unit: Unit.TIME, category: 'BIEGI', distance: '4x100m', isRelay: true },
    { id: '4x400m', name: '4x400m', type: EventType.RELAY, unit: Unit.TIME, category: 'BIEGI', distance: '4x400m', isRelay: true },
    { id: '4x800m', name: '4x800m', type: EventType.RELAY, unit: Unit.TIME, category: 'BIEGI', distance: '4x800m', isRelay: true },
  ],
  
  SKOKI: [
    { id: 'high_jump', name: 'Skok wzwyż', type: EventType.FIELD, unit: Unit.HEIGHT, category: 'SKOKI' },
    { id: 'pole_vault', name: 'Skok o tyczce', type: EventType.FIELD, unit: Unit.HEIGHT, category: 'SKOKI' },
    { id: 'long_jump', name: 'Skok w dal', type: EventType.FIELD, unit: Unit.DISTANCE, category: 'SKOKI' },
    { id: 'triple_jump', name: 'Trójskok', type: EventType.FIELD, unit: Unit.DISTANCE, category: 'SKOKI' },
  ],
  
  RZUTY: [
    { id: 'shot_put', name: 'Pchnięcie kulą', type: EventType.FIELD, unit: Unit.DISTANCE, category: 'RZUTY' },
    { id: 'discus_throw', name: 'Rzut dyskiem', type: EventType.FIELD, unit: Unit.DISTANCE, category: 'RZUTY' },
    { id: 'hammer_throw', name: 'Rzut młotem', type: EventType.FIELD, unit: Unit.DISTANCE, category: 'RZUTY' },
    { id: 'javelin_throw', name: 'Rzut oszczepem', type: EventType.FIELD, unit: Unit.DISTANCE, category: 'RZUTY' },
  ],
  
  WIELOBOJE: [
    { id: 'heptathlon', name: 'Siedmiobój', type: EventType.COMBINED, unit: Unit.POINTS, category: 'WIELOBOJE' },
    { id: 'decathlon', name: 'Dziesięciobój', type: EventType.COMBINED, unit: Unit.POINTS, category: 'WIELOBOJE' },
    { id: 'pentathlon', name: 'Pięciobój', type: EventType.COMBINED, unit: Unit.POINTS, category: 'WIELOBOJE' },
  ],
};

export const DISCIPLINE_CATEGORIES = [
  { id: 'BIEGI', name: 'Biegi', icon: '🏃' },
  { id: 'SKOKI', name: 'Skoki', icon: '🦘' },
  { id: 'RZUTY', name: 'Rzuty', icon: '🥇' },
  { id: 'WIELOBOJE', name: 'Wieloboje', icon: '🏆' },
] as const;

export function getDisciplineById(id: string): Discipline | undefined {
  for (const category of Object.values(DISCIPLINES)) {
    const discipline = category.find(d => d.id === id);
    if (discipline) return discipline;
  }
  return undefined;
}

export function generateEventName(discipline: Discipline, gender: string, category: string): string {
  const genderText = gender === 'MALE' ? 'mężczyzn' : gender === 'FEMALE' ? 'kobiet' : 'mieszane';
  return `${discipline.name} ${genderText} (${category})`;
}