export declare class SecurityLoggerService {
    private logger;
    constructor();
    logFailedLogin(email: string, ip: string, userAgent?: string): void;
    logSuccessfulLogin(userId: string, email: string, ip: string, userAgent?: string): void;
    logFailedRegistration(email: string, reason: string, ip: string): void;
    logSuspiciousActivity(userId: string, activity: string, details: any): void;
    logUnauthorizedAccess(path: string, ip: string, userAgent?: string): void;
    logRateLimitExceeded(ip: string, endpoint: string): void;
}
