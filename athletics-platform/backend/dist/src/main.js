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
    console.log('🔧 Starting bootstrap...');
    const logger = new common_1.Logger('Bootstrap');
    try {
        console.log('📦 Creating NestFactory...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        console.log('✅ NestFactory created successfully');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        const securityLogger = app.get(security_logger_service_1.SecurityLoggerService);
        app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new all_exceptions_filter_1.AllExceptionsFilter(securityLogger));
        app.useGlobalInterceptors(new performance_interceptor_1.PerformanceInterceptor());
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                    return callback(null, true);
                }
                if (origin.includes('.railway.app') ||
                    origin.includes('.up.railway.app')) {
                    return callback(null, true);
                }
                if (origin.includes('.vercel.app')) {
                    return callback(null, true);
                }
                const frontendUrls = process.env.FRONTEND_URL?.split(',').map((url) => url.trim()) || [];
                if (frontendUrls.includes(origin)) {
                    return callback(null, true);
                }
                logger.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'Accept',
                'Origin',
                'X-CSRF-Token',
            ],
            exposedHeaders: ['Set-Cookie'],
        });
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
        console.log(`📍 PORT env var: ${process.env.PORT}`);
        console.log(`📍 Parsed port: ${port}`);
        console.log(`📍 Attempting to listen on port ${port}...`);
        await app.listen(port, '0.0.0.0');
        logger.log(`🚀 Backend running on port ${port}`);
        console.log(`✅ Application listening on 0.0.0.0:${port}`);
    }
    catch (error) {
        console.error('❌ Bootstrap failed:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map