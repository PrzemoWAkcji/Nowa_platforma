import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';

@Injectable()
export class AppLoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.context = undefined;

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'athletics-platform-backend' },
      transports: [
        // Error logs - separate file
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true,
        }),
        // Combined logs
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true,
        }),
        // Warn logs - separate file
        new winston.transports.File({
          filename: path.join(logsDir, 'warn.log'),
          level: 'warn',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true,
        }),
      ],
    });

    // Console in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                const ctx = context || this.context || 'App';
                const metaStr = Object.keys(meta).length
                  ? JSON.stringify(meta, null, 2)
                  : '';
                return `[${timestamp}] ${level} [${ctx}] ${message} ${metaStr}`;
              },
            ),
          ),
        }),
      );
    }
  }

  /**
   * Log a message at the 'log' level (info)
   */
  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  /**
   * Log an error message
   */
  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  /**
   * Log a verbose message
   */
  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
  ) {
    this.logger.info('HTTP Request', {
      context: 'HTTP',
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userId,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, context?: string) {
    this.logger.debug('Database Query', {
      context: context || 'Database',
      query,
      duration: `${duration}ms`,
    });
  }

  /**
   * Log with custom metadata
   */
  logWithMeta(level: string, message: string, meta: Record<string, any>) {
    this.logger.log(level, message, {
      context: this.context,
      ...meta,
    });
  }

  /**
   * Create a child logger with a specific context
   */
  setContext(context: string): AppLoggerService {
    const childLogger = new AppLoggerService();
    childLogger.context = context;
    return childLogger;
  }
}
