import { FinishlynxService } from './finishlynx.service';
import { ImportFinishlynxDto, ImportFileDto, FinishlynxAthleteResultDto } from './dto/import-finishlynx.dto';
export declare class FinishlynxController {
    private readonly finishlynxService;
    constructor(finishlynxService: FinishlynxService);
    importResults(importFinishlynxDto: ImportFinishlynxDto): Promise<{
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
    importFromFile(file: Express.Multer.File, competitionId?: string): Promise<{
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
    validateFile(file: Express.Multer.File): {
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
    getImportHistory(): {
        message: string;
        imports: never[];
    };
    manualImport(importFileDto: ImportFileDto): Promise<{
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
    previewFile(file: Express.Multer.File, competitionId?: string): Promise<{
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
    getEventMappingSuggestions(competitionId: string, eventName: string): Promise<{
        id: string;
        name: string;
        category: string | undefined;
        gender: string | undefined;
        distance: string | undefined;
        discipline: string | undefined;
        mappingScore: number;
    }[]>;
    importWithMapping(data: {
        importData: ImportFinishlynxDto;
        eventMappings: {
            [finishlynxEventName: string]: string;
        };
        competitionId: string;
    }): Promise<{
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
    importResultsFromAgent(data: {
        competitionId: string;
        fileName: string;
        results: FinishlynxAthleteResultDto[];
    }): Promise<{
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
    exportStartLists(competitionId: string): Promise<{
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
    generateAgentConfig(competitionId: string, request: {
        user: {
            id: string;
            email: string;
            role: string;
        };
    }): Promise<{
        filename: string;
        content: string;
        mimeType: string;
    }>;
}
