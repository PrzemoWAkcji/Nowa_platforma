import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus() as HttpStatus;

    // Log szczegółowy błąd dla deweloperów
    this.logger.error(
      `HTTP Exception: ${exception.message}`,
      exception.stack,
      `${request.method} ${request.url}`,
    );

    // W produkcji zwracaj ogólne komunikaty błędów
    const isProduction = process.env.NODE_ENV === 'production';

    let message: string;

    if (isProduction) {
      // Bezpieczne komunikaty dla produkcji
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          message = 'Brak autoryzacji';
          break;
        case HttpStatus.FORBIDDEN:
          message = 'Brak uprawnień';
          break;
        case HttpStatus.NOT_FOUND:
          message = 'Zasób nie został znaleziony';
          break;
        case HttpStatus.BAD_REQUEST:
          message = 'Nieprawidłowe żądanie';
          break;
        case HttpStatus.CONFLICT:
          message = 'Konflikt danych';
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
          message = 'Wewnętrzny błąd serwera';
          break;
        default:
          message = 'Wystąpił błąd';
      }
    } else {
      // W developmencie pokazuj szczegółowe błędy
      const exceptionResponse = exception.getResponse();
      message = exception.message;
    }

    const responseBody: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // W developmencie dodaj szczegółowe informacje o błędzie walidacji
    if (
      !isProduction &&
      status === HttpStatus.BAD_REQUEST &&
      typeof exception.getResponse() === 'object'
    ) {
      const exceptionResponse = exception.getResponse() as any;
      if (
        exceptionResponse.message &&
        Array.isArray(exceptionResponse.message)
      ) {
        responseBody.validationErrors = exceptionResponse.message;
      }
    }

    response.status(status).json(responseBody);
  }
}
