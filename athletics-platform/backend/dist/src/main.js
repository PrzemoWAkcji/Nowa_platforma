"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const performance_interceptor_1 = require("./common/interceptors/performance.interceptor");
const security_logger_service_1 = require("./common/logger/security-logger.service");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const securityLogger = app.get(security_logger_service_1.SecurityLoggerService);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new all_exceptions_filter_1.AllExceptionsFilter(securityLogger));
    app.useGlobalInterceptors(new performance_interceptor_1.PerformanceInterceptor());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
        ],
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map