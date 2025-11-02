import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { SecurityLoggerService } from './common/logger/security-logger.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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
