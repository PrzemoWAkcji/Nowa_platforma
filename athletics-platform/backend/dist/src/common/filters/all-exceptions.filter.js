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
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const security_logger_service_1 = require("../logger/security-logger.service");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    securityLogger;
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    constructor(securityLogger) {
        this.securityLogger = securityLogger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'string'
                ? exceptionResponse
                : exceptionResponse?.message || exception.message;
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Wewnętrzny błąd serwera';
            this.logger.error(`Unexpected error: ${exception}`, exception instanceof Error ? exception.stack : 'No stack trace', `${request.method} ${request.url}`);
            if (this.securityLogger) {
                this.securityLogger.logSuspiciousActivity('system', 'UNEXPECTED_ERROR', {
                    error: exception instanceof Error ? exception.message : String(exception),
                    path: request.url,
                    method: request.method,
                    ip: request.ip,
                    userAgent: request.get('User-Agent'),
                });
            }
        }
        if (status >= 400) {
            this.logger.warn(`HTTP ${status} Error: ${message}`, `${request.method} ${request.url} - IP: ${request.ip}`);
        }
        if (this.securityLogger && (status === 401 || status === 403)) {
            this.securityLogger.logUnauthorizedAccess(request.url, request.ip || 'unknown', request.get('User-Agent'));
        }
        const errorResponse = {
            statusCode: status,
            message: process.env.NODE_ENV === 'production'
                ? this.getProductionMessage(status)
                : message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        response.status(status).json(errorResponse);
    }
    getProductionMessage(status) {
        switch (status) {
            case common_1.HttpStatus.UNAUTHORIZED:
                return 'Brak autoryzacji';
            case common_1.HttpStatus.FORBIDDEN:
                return 'Brak uprawnień';
            case common_1.HttpStatus.NOT_FOUND:
                return 'Zasób nie został znaleziony';
            case common_1.HttpStatus.BAD_REQUEST:
                return 'Nieprawidłowe żądanie';
            case common_1.HttpStatus.CONFLICT:
                return 'Konflikt danych';
            case common_1.HttpStatus.TOO_MANY_REQUESTS:
                return 'Zbyt wiele żądań';
            case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
                return 'Wewnętrzny błąd serwera';
            default:
                return 'Wystąpił błąd';
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [security_logger_service_1.SecurityLoggerService])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map