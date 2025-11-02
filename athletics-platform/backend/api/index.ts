/**
 * Vercel Serverless Function Entry Point
 *
 * Ten plik jest używany przez Vercel do uruchomienia aplikacji NestJS
 * jako serverless function.
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // CORS Configuration
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://localhost:3000',
        // Dodaj swoją domenę Vercel tutaj:
        /^https:\/\/.*\.vercel\.app$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });

    // Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Trust proxy for Vercel
    app.set('trust proxy', 1);

    // Swagger Documentation (tylko w development)
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Athletics Platform API')
        .setDescription('API documentation for Athletics Platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
    }

    await app.init();
  }
  return app;
}

// Vercel Serverless Handler
export default async (req: any, res: any) => {
  const server = await bootstrap();
  const httpAdapter = server.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  return instance(req, res);
};
