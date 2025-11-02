import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
export interface PzlaResult {
    event: string;
    result: string;
    date: string;
    competition: string;
    location?: string;
    wind?: string;
    isPersonalBest?: boolean;
    isSeasonBest?: boolean;
}
export interface PzlaAthleteData {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    club?: string;
    licenseNumber?: string;
    results: PzlaResult[];
}
export declare class PzlaIntegrationService {
    private readonly httpService;
    private readonly prisma;
    private readonly logger;
    private readonly PZLA_BASE_URL;
    constructor(httpService: HttpService, prisma: PrismaService);
    private delay;
    searchAthleteByLicense(licenseNumber: string): Promise<PzlaAthleteData | null>;
    searchAthleteByName(firstName: string, lastName: string, dateOfBirth?: Date): Promise<PzlaAthleteData | null>;
    private parseSearchResults;
    private fetchAthleteDetails;
    private findBestMatch;
    fetchAthleteResults(athleteUrl: string): Promise<PzlaResult[]>;
    updateAthleteRecordsFromPzla(athleteId: string): Promise<{
        updated: boolean;
        personalBests: any;
        seasonBests: any;
        errors: string[];
    }>;
    private processPzlaResults;
    private isBetterResult;
    private isTimeBasedEvent;
    private parseTimeToSeconds;
    private normalizeDate;
    private normalizeEventName;
    private normalizeResult;
    updateAllAthletesWithoutRecords(): Promise<{
        processed: number;
        updated: number;
        errors: string[];
    }>;
    private getMockAthleteData;
    private getMockAthleteDataByName;
}
