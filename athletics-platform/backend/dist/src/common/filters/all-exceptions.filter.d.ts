import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { SecurityLoggerService } from '../logger/security-logger.service';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private securityLogger?;
    private readonly logger;
    constructor(securityLogger?: SecurityLoggerService | undefined);
    catch(exception: unknown, host: ArgumentsHost): void;
    private getProductionMessage;
}
