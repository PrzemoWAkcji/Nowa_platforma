import { PrismaService } from '../prisma/prisma.service';
import { ImportFinishlynxDto, ImportFileDto } from './dto/import-finishlynx.dto';
export declare class FinishlynxService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    importFromFile(importFileDto: ImportFileDto): Promise<{
        message: string;
        processedResults: number;
        totalResults: number;
        errors: string[];
        results: {
            athlete: string;
            event: string;
            result: string;
            position: string;
            heat: string;
            status?: string;
        }[];
    } | {
        message: string;
        eventsCount: number;
    }>;
    private parseEvtFile;
    private parseLifFile;
    private parseSchFile;
    processImportedData(data: ImportFinishlynxDto): Promise<{
        message: string;
        processedResults: number;
        totalResults: number;
        errors: string[];
        results: {
            athlete: string;
            event: string;
            result: string;
            position: string;
            heat: string;
            status?: string;
        }[];
    }>;
    getImportHistory(): {
        message: string;
        imports: never[];
    };
    getEventMappingSuggestions(competitionId: string, finishlynxEventName: string): Promise<{
        id: string;
        name: string;
        category: string | undefined;
        gender: string | undefined;
        distance: string | undefined;
        discipline: string | undefined;
        mappingScore: number;
    }[]>;
    private calculateMappingScore;
    importWithCustomMapping(importData: ImportFinishlynxDto, eventMappings: {
        [finishlynxEventName: string]: string;
    }, competitionId: string): Promise<{
        message: string;
        processedResults: number;
        totalResults: number;
        errors: string[];
        results: {
            athlete: string;
            event: string;
            result: string;
            position: string;
            heat: string;
            status?: string;
        }[];
    }>;
    private processImportedDataWithMapping;
    processAgentResults(competitionId: string, fileName: string, results: Array<{
        licenseNumber: string;
        result?: string;
        position?: string;
        wind?: string;
        reactionTime?: string;
        status?: string;
        eventInfo?: {
            eventName?: string;
            heat?: string;
        };
    }>): Promise<{
        message: string;
        fileName: string;
        processedResults: number;
        totalResults: number;
        errors: string[];
        results: {
            athlete: string;
            event: string;
            result: string;
            position?: number;
            status?: string;
        }[];
    }>;
    exportStartListsForAgent(competitionId: string): Promise<{
        eventNumber: string;
        name: string;
        round: string;
        heat: string;
        scheduledTime: string;
        registrations: {
            startNumber: string;
            athlete: {
                firstName: string;
                lastName: string;
                licenseNumber: string;
                club: string;
            };
        }[];
    }[]>;
    generateAgentConfigFile(competitionId: string, user: {
        email?: string;
    }): Promise<{
        filename: string;
        content: string;
        mimeType: string;
    }>;
    private mapFinishlynxEventName;
    previewFile(content: string, fileType: string, competitionId?: string): Promise<{
        fileType: string;
        eventInfo: {
            eventNumber: string;
            round: string;
            heat: string;
            eventName: string;
            timestamp?: string;
        } | null;
        athletes: {
            position: string;
            startNumber: string;
            club: string;
            licenseNumber: string;
            result: string;
            reactionTime: string;
            wind: string;
            status: string | null;
            athlete: string;
            athleteFound: boolean;
        }[];
        eventSuggestions: {
            id: string;
            name: string;
            category?: string;
            gender?: string;
            distance?: string;
            discipline?: string;
            mappingScore: number;
        }[];
        summary: {
            totalAthletes: number;
            athletesFound: number;
            athletesNotFound: number;
            dnsCount: number;
            dnfCount: number;
            dqCount: number;
        };
    } | {
        fileType: string;
        events: {
            eventNumber: string;
            round: string;
            heat: string;
            eventName: string;
        }[];
        athletes: {
            eventNumber: string;
            eventName: string;
            startNumber: string;
            position: string;
            lastName: string;
            firstName: string;
            club: string;
            licenseNumber: string;
            athlete: string;
            athleteFound: boolean;
        }[];
        summary: {
            totalEvents: number;
            totalAthletes: number;
            athletesFound: number;
            athletesNotFound: number;
        };
    } | {
        fileType: string;
        schedule: {
            eventNumber: string;
            round: string;
            heat: string;
        }[];
        summary: {
            totalEntries: number;
        };
    }>;
    private previewLifFile;
    private previewEvtFile;
    private previewSchFile;
    validateFinishlynxFile(fileContent: string, fileType: string): {
        valid: boolean;
        fileType: string;
        resultCount: number;
        message: string;
    } | {
        valid: boolean;
        fileType: string;
        eventCount: number;
        message: string;
    };
    private validateEvtFile;
    private validateLifFile;
    private validateSchFile;
}
