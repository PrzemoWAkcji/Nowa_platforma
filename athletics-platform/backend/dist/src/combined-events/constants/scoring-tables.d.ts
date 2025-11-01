import { EventCoefficients } from '../types/combined-events.types';
export declare const SCORING_COEFFICIENTS: Record<string, EventCoefficients>;
export declare function getScoringCoefficients(discipline: string, gender?: 'MALE' | 'FEMALE'): EventCoefficients;
export declare function parseTimeToSeconds(timeString: string): number;
export declare function parseDistanceToMeters(distanceString: string): number;
export declare function parseHeightToMeters(heightString: string): number;
export declare function isTrackEvent(discipline: string): boolean;
