"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        this.logger.error(`HTTP Exception: ${exception.message}`, exception.stack, `${request.method} ${request.url}`);
        const isProduction = process.env.NODE_ENV === 'production';
        let message;
        if (isProduction) {
            switch (status) {
                case common_1.HttpStatus.UNAUTHORIZED:
                    message = 'Brak autoryzacji';
                    break;
                case common_1.HttpStatus.FORBIDDEN:
                    message = 'Brak uprawnień';
                    break;
                case common_1.HttpStatus.NOT_FOUND:
                    message = 'Zasób nie został znaleziony';
                    break;
                case common_1.HttpStatus.BAD_REQUEST:
                    message = 'Nieprawidłowe żądanie';
                    break;
                case common_1.HttpStatus.CONFLICT:
                    message = 'Konflikt danych';
                    break;
                case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
                    message = 'Wewnętrzny błąd serwera';
                    break;
                default:
                    message = 'Wystąpił błąd';
            }
        }
        else {
            const exceptionResponse = exception.getResponse();
            message = exception.message;
        }
        const responseBody = {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        if (!isProduction &&
            status === common_1.HttpStatus.BAD_REQUEST &&
            typeof exception.getResponse() === 'object') {
            const exceptionResponse = exception.getResponse();
            if (exceptionResponse.message &&
                Array.isArray(exceptionResponse.message)) {
                responseBody.validationErrors = exceptionResponse.message;
            }
        }
        response.status(status).json(responseBody);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map