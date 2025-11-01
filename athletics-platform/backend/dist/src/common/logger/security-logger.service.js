"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston = require("winston");
let SecurityLoggerService = class SecurityLoggerService {
    logger;
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            defaultMeta: { service: 'athletics-platform-security' },
            transports: [
                new winston.transports.File({
                    filename: 'logs/security-error.log',
                    level: 'error',
                }),
                new winston.transports.File({
                    filename: 'logs/security-combined.log',
                }),
            ],
        });
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
    }
    logFailedLogin(email, ip, userAgent) {
        this.logger.warn('Failed login attempt', {
            event: 'FAILED_LOGIN',
            email,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        });
    }
    logSuccessfulLogin(userId, email, ip, userAgent) {
        this.logger.info('Successful login', {
            event: 'SUCCESSFUL_LOGIN',
            userId,
            email,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        });
    }
    logFailedRegistration(email, reason, ip) {
        this.logger.warn('Failed registration attempt', {
            event: 'FAILED_REGISTRATION',
            email,
            reason,
            ip,
            timestamp: new Date().toISOString(),
        });
    }
    logSuspiciousActivity(userId, activity, details) {
        this.logger.error('Suspicious activity detected', {
            event: 'SUSPICIOUS_ACTIVITY',
            userId,
            activity,
            details,
            timestamp: new Date().toISOString(),
        });
    }
    logUnauthorizedAccess(path, ip, userAgent) {
        this.logger.warn('Unauthorized access attempt', {
            event: 'UNAUTHORIZED_ACCESS',
            path,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        });
    }
    logRateLimitExceeded(ip, endpoint) {
        this.logger.warn('Rate limit exceeded', {
            event: 'RATE_LIMIT_EXCEEDED',
            ip,
            endpoint,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.SecurityLoggerService = SecurityLoggerService;
exports.SecurityLoggerService = SecurityLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SecurityLoggerService);
//# sourceMappingURL=security-logger.service.js.map