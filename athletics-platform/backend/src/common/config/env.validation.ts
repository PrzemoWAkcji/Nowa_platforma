import { plainToInstance, Transform } from 'class-transformer';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 3002;

  @IsString()
  @IsOptional()
  DATABASE_URL: string = 'file:./dev.db';

  @IsString()
  @IsOptional()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d'; // 7 days

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:3000';

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_TTL: number = 60000; // 1 minute

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_LIMIT: number = 100;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  CACHE_TTL: number = 300; // 5 minutes

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  CACHE_MAX: number = 100;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation error: ${errors.toString()}`);
  }

  // Additional security checks for production
  if (validatedConfig.NODE_ENV === Environment.Production) {
    if (!validatedConfig.JWT_SECRET || validatedConfig.JWT_SECRET.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long in production',
      );
    }

    if (validatedConfig.DATABASE_URL.includes('file:')) {
      console.warn(
        'WARNING: Using SQLite in production. Consider using PostgreSQL or MySQL.',
      );
    }
  }

  return validatedConfig;
}
