import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const code = exception?.code;
    const detail = exception?.detail || exception?.message || '';

    // PostgreSQL 23505: unique_violation
    if (code === '23505') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Conflicto: Ya existe un registro con estos datos únicos.',
        detail,
        error: 'Conflict',
      });
    }

    // PostgreSQL 23503: foreign_key_violation
    if (code === '23503') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message:
          'Conflicto de integridad referencial: El recurso relacionado no existe o tiene restricciones activas.',
        detail,
        error: 'Conflict',
      });
    }

    // PostgreSQL 23502: not_null_violation
    if (code === '23502') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Faltan campos requeridos en la base de datos.',
        detail,
        error: 'Bad Request',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error en la operación de base de datos.',
      detail: exception?.message,
      error: 'Internal Server Error',
    });
  }
}
