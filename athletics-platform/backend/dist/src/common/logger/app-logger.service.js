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
var AppLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLoggerService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
let AppLoggerService = AppLoggerService_1 = class AppLoggerService {
    logger;
    context;
    constructor() {
        this.context = undefined;
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json()),
            defaultMeta: { service: 'athletics-platform-backend' },
            transports: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'error.log'),
                    level: 'error',
                    maxsize: 5242880,
                    maxFiles: 5,
                    tailable: true,
                }),
                new winston.transports.File({
                    filename: path.join(logsDir, 'combined.log'),
                    maxsize: 5242880,
                    maxFiles: 5,
                    tailable: true,
                }),
                new winston.transports.File({
                    filename: path.join(logsDir, 'warn.log'),
                    level: 'warn',
                    maxsize: 5242880,
                    maxFiles: 5,
                    tailable: true,
                }),
            ],
        });
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize({ all: true }), winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                    const ctx = context || this.context || 'App';
                    const metaStr = Object.keys(meta).length
                        ? JSON.stringify(meta, null, 2)
                        : '';
                    return `[${timestamp}] ${level} [${ctx}] ${message} ${metaStr}`;
                })),
            }));
        }
    }
    log(message, context) {
        this.logger.info(message, { context: context || this.context });
    }
    error(message, trace, context) {
        this.logger.error(message, {
            context: context || this.context,
            trace,
        });
    }
    warn(message, context) {
        this.logger.warn(message, { context: context || this.context });
    }
    debug(message, context) {
        this.logger.debug(message, { context: context || this.context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context: context || this.context });
    }
    logRequest(method, url, statusCode, responseTime, userId) {
        this.logger.info('HTTP Request', {
            context: 'HTTP',
            method,
            url,
            statusCode,
            responseTime: `${responseTime}ms`,
            userId,
        });
    }
    logQuery(query, duration, context) {
        this.logger.debug('Database Query', {
            context: context || 'Database',
            query,
            duration: `${duration}ms`,
        });
    }
    logWithMeta(level, message, meta) {
        this.logger.log(level, message, {
            context: this.context,
            ...meta,
        });
    }
    setContext(context) {
        const childLogger = new AppLoggerService_1();
        childLogger.context = context;
        return childLogger;
    }
};
exports.AppLoggerService = AppLoggerService;
exports.AppLoggerService = AppLoggerService = AppLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppLoggerService);
//# sourceMappingURL=app-logger.service.js.map