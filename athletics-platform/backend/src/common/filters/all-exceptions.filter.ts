import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SecurityLoggerService } from '../logger/security-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private securityLogger?: SecurityLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any)?.message || exception.message;
    } else {
      // Unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Wewnętrzny błąd serwera';
      
      // Log critical errors
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : 'No stack trace',
        `${request.method} ${request.url}`,
      );

      // Log security-related errors
      if (this.securityLogger) {
        this.securityLogger.logSuspiciousActivity(
          'system',
          'UNEXPECTED_ERROR',
          {
            error: exception instanceof Error ? exception.message : String(exception),
            path: request.url,
            method: request.method,
            ip: request.ip,
            userAgent: request.get('User-Agent'),
          }
        );
      }
    }

    // Log HTTP errors for monitoring
    if (status >= 400) {
      this.logger.warn(
        `HTTP ${status} Error: ${message}`,
        `${request.method} ${request.url} - IP: ${request.ip}`,
      );
    }

    // Security logging for suspicious activities
    if (this.securityLogger && (status === 401 || status === 403)) {
      this.securityLogger.logUnauthorizedAccess(
        request.url,
        request.ip || 'unknown',
        request.get('User-Agent'),
      );
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

  private getProductionMessage(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return 'Brak autoryzacji';
      case HttpStatus.FORBIDDEN:
        return 'Brak uprawnień';
      case HttpStatus.NOT_FOUND:
        return 'Zasób nie został znaleziony';
      case HttpStatus.BAD_REQUEST:
        return 'Nieprawidłowe żądanie';
      case HttpStatus.CONFLICT:
        return 'Konflikt danych';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Zbyt wiele żądań';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Wewnętrzny błąd serwera';
      default:
        return 'Wystąpił błąd';
    }
  }
}