import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { SecurityLoggerService } from './common/logger/security-logger.service';

async function bootstrap() {
  console.log('🔧 Starting bootstrap...');
  const logger = new Logger('Bootstrap');
  try {
    console.log('📦 Creating NestFactory...');
    const app = await NestFactory.create(AppModule);
    console.log('✅ NestFactory created successfully');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  const securityLogger = app.get(SecurityLoggerService);
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new AllExceptionsFilter(securityLogger),
  );

  // Global interceptors
  app.useGlobalInterceptors(new PerformanceInterceptor());

  // Note: ThrottlerGuard is already registered globally in AppModule as APP_GUARD

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      // Allow Railway domains (backend and frontend)
      if (
        origin.includes('.railway.app') ||
        origin.includes('.up.railway.app')
      ) {
        return callback(null, true);
      }

      // Allow Vercel domains
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }

      // Allow configured frontend URLs (comma-separated list)
      const frontendUrls =
        process.env.FRONTEND_URL?.split(',').map((url) => url.trim()) || [];
      if (frontendUrls.includes(origin)) {
        return callback(null, true);
      }

      // Log rejected origins for debugging
      logger.warn(`CORS blocked origin: ${origin}`);

      // Reject other origins
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
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}
bootstrap();
