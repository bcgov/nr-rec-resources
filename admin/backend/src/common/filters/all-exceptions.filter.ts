import { UnauthorizedUserException } from '@/common/exceptions/unauthorized-user.exception';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { Request, Response } from 'express';

/**
 * Global exception filter that catches all unhandled exceptions.
 * Handles:
 * - HTTP exceptions (NestJS exceptions like NotFoundException, BadRequestException)
 * - Prisma database errors (converts to appropriate HTTP exceptions)
 * - Custom exceptions (UnauthorizedUserException)
 * - Generic errors (converts to 500 Internal Server Error)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle Prisma errors first (before they become generic errors)
    if (this.isPrismaError(exception)) {
      return this.handlePrismaError(exception, request, response);
    }

    // Handle custom UnauthorizedUserException
    if (exception instanceof UnauthorizedUserException) {
      return response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
        error: 'Forbidden',
      });
    }

    // Handle standard HTTP exceptions (NotFoundException, BadRequestException, etc.)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : exception instanceof Error
            ? exception.message
            : 'Internal server error',
    };

    // For validation errors handled by the exceptionFactory in ValidationPipe,
    // the response will already be formatted. We can check for that.
    if (
      exception instanceof HttpException &&
      typeof exception.getResponse() === 'object'
    ) {
      Object.assign(errorResponse, exception.getResponse());
    }

    // Log internal server errors for debugging
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Internal server error on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Checks if the error is a Prisma error
   */
  private isPrismaError(exception: unknown): boolean {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError ||
      exception instanceof Prisma.PrismaClientInitializationError
    );
  }

  /**
   * Handles Prisma-specific errors and converts them to appropriate HTTP responses
   */
  private handlePrismaError(
    exception: unknown,
    request: Request,
    response: Response,
  ): void {
    let httpException: HttpException;

    // Handle known Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      httpException = this.convertPrismaKnownError(exception);
    }
    // Handle Prisma validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      httpException = new BadRequestException(
        'Invalid data provided to database operation',
      );
    }
    // Handle Prisma initialization errors
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error('Database initialization error', exception);
      httpException = new HttpException(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    // Fallback for other Prisma errors
    else {
      this.logger.error('Unknown Prisma error', exception);
      httpException = new HttpException(
        'Database error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const status = httpException.getStatus();
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: httpException.message,
      error: httpException.name,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Converts Prisma known errors to appropriate HTTP exceptions
   */
  private convertPrismaKnownError(
    error: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (error.code) {
      case 'P2000': // Value too long for column
        return new BadRequestException(
          'The provided value is too long for the database field',
        );

      case 'P2001': // Record not found
      case 'P2025': // Record to delete/update not found
        return new NotFoundException(
          'The requested resource was not found in the database',
        );

      case 'P2002': {
        // Unique constraint violation
        const uniqueField = this.extractFieldFromMeta(error.meta);
        return new BadRequestException(
          uniqueField
            ? `A record with this ${uniqueField} already exists`
            : 'This record violates a unique constraint',
        );
      }

      case 'P2003': {
        // Foreign key constraint violation
        const fkField = this.extractForeignKeyField(error.message);
        return new BadRequestException(
          fkField
            ? `Invalid reference: ${fkField} does not exist`
            : 'This operation violates a foreign key constraint',
        );
      }

      case 'P2011': {
        // Null constraint violation
        const nullField = this.extractFieldFromMeta(error.meta);
        return new BadRequestException(
          nullField
            ? `${nullField} is required and cannot be null`
            : 'A required field is missing',
        );
      }

      case 'P2014': // Required relation violation
        return new BadRequestException(
          'The operation violates a required relation',
        );

      default:
        // Log unknown Prisma error codes for debugging
        this.logger.error(
          `Unknown Prisma error code: ${error.code}`,
          error.message,
        );
        return new HttpException(
          'A database error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  /**
   * Extracts field name from Prisma error metadata
   */
  private extractFieldFromMeta(meta: any): string | null {
    if (meta?.target && Array.isArray(meta.target)) {
      return meta.target.join(', ');
    }
    return null;
  }

  /**
   * Extracts foreign key field from error message
   */
  private extractForeignKeyField(message: string): string | null {
    const match = message.match(
      /Foreign key constraint failed on the field: `(.+?)`/,
    );
    return match?.[1] ?? null;
  }
}
