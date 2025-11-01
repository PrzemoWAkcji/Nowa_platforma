import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class SecurityLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
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
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      );
    }
  }

  logFailedLogin(email: string, ip: string, userAgent?: string) {
    this.logger.warn('Failed login attempt', {
      event: 'FAILED_LOGIN',
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  logSuccessfulLogin(userId: string, email: string, ip: string, userAgent?: string) {
    this.logger.info('Successful login', {
      event: 'SUCCESSFUL_LOGIN',
      userId,
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  logFailedRegistration(email: string, reason: string, ip: string) {
    this.logger.warn('Failed registration attempt', {
      event: 'FAILED_REGISTRATION',
      email,
      reason,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  logSuspiciousActivity(userId: string, activity: string, details: any) {
    this.logger.error('Suspicious activity detected', {
      event: 'SUSPICIOUS_ACTIVITY',
      userId,
      activity,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  logUnauthorizedAccess(path: string, ip: string, userAgent?: string) {
    this.logger.warn('Unauthorized access attempt', {
      event: 'UNAUTHORIZED_ACCESS',
      path,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  logRateLimitExceeded(ip: string, endpoint: string) {
    this.logger.warn('Rate limit exceeded', {
      event: 'RATE_LIMIT_EXCEEDED',
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
    });
  }
}