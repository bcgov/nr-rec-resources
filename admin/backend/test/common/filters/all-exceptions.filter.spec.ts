import { UnauthorizedUserException } from '@/common/exceptions/unauthorized-user.exception';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockRequest = { url: '/test-url' };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const switchToHttp = vi.fn().mockReturnValue({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    });

    mockHost = {
      switchToHttp,
    } as unknown as ArgumentsHost;
  });

  it('should handle generic HttpException', () => {
    const exception = new BadRequestException('Invalid data');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/test-url',
        message: 'Invalid data',
      }),
    );
  });

  it('should handle non-HttpException error', () => {
    const exception = new Error('Something broke');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/test-url',
        message: 'Something broke',
      }),
    );
  });

  it('should handle non-HttpException error with no message', () => {
    const exception = {};

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/test-url',
        message: 'Internal server error',
      }),
    );
  });

  it('should merge object response from HttpException', () => {
    const responseBody = {
      statusCode: 400,
      message: ['name must not be empty'],
      error: 'Bad Request',
    };

    const exception = new BadRequestException(responseBody);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['name must not be empty'],
        error: 'Bad Request',
        path: '/test-url',
      }),
    );
  });

  it('should handle UnauthorizedUserException with special 403 response', () => {
    const exception = new UnauthorizedUserException();

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User is not properly authenticated',
        error: 'Forbidden',
        path: '/test-url',
      }),
    );
  });

  describe('Prisma error handling', () => {
    it('should handle Prisma P2025 (record not found) as 404', async () => {
      const { Prisma } = await import('@prisma/client');
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
          meta: {},
        },
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          path: '/test-url',
          message: 'The requested resource was not found in the database',
        }),
      );
    });

    it('should handle Prisma P2002 (unique constraint) as 400', async () => {
      const { Prisma } = await import('@prisma/client');
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] },
        },
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          path: '/test-url',
          message: 'A record with this email already exists',
        }),
      );
    });

    it('should handle Prisma P2003 (foreign key constraint) as 400', async () => {
      const { Prisma } = await import('@prisma/client');
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed on the field: `control_access_code`',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
          meta: {},
        },
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          path: '/test-url',
          message: 'Invalid reference: control_access_code does not exist',
        }),
      );
    });

    it('should handle Prisma validation error as 400', async () => {
      const { Prisma } = await import('@prisma/client');
      const exception = new Prisma.PrismaClientValidationError('Invalid data', {
        clientVersion: '5.0.0',
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          path: '/test-url',
          message: 'Invalid data provided to database operation',
        }),
      );
    });

    it('should handle unknown Prisma error code as 500', async () => {
      const { Prisma } = await import('@prisma/client');
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unknown error',
        {
          code: 'P9999',
          clientVersion: '5.0.0',
          meta: {},
        },
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          path: '/test-url',
          message: 'A database error occurred',
        }),
      );
    });
  });
});
