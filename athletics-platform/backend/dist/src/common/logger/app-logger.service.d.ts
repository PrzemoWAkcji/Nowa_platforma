import { LoggerService as NestLoggerService } from '@nestjs/common';
export declare class AppLoggerService implements NestLoggerService {
    private logger;
    private context?;
    constructor();
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    logRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string): void;
    logQuery(query: string, duration: number, context?: string): void;
    logWithMeta(level: string, message: string, meta: Record<string, any>): void;
    setContext(context: string): AppLoggerService;
}
