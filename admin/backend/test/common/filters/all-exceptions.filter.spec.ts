import { UnauthorizedUserException } from '@/common/exceptions/unauthorized-user.exception';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  const makeMockRes = () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    return { status, json };
  };

  const makeMockReq = (url = '/test-url', method = 'GET') => ({ url, method });

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    vi.clearAllMocks();
  });

  it('handles standard HttpException (NotFoundException)', () => {
    const exception = new NotFoundException('Not found');
    const res: any = makeMockRes();
    const req: any = makeMockReq('/not-found', 'GET');

    // Call catch via ArgumentsHost mock
    const host: any = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    };

    filter.catch(exception, host as any);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.status().json).toHaveBeenCalled();
    const body = res.status().json.mock.calls[0][0];
    expect(body.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body.path).toBe('/not-found');
  });

  it('handles UnauthorizedUserException with 403', () => {
    const exception = new UnauthorizedUserException();
    const res: any = makeMockRes();
    const req: any = makeMockReq('/forbidden', 'POST');

    const host: any = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    };

    filter.catch(exception, host as any);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    const body = res.status().json.mock.calls[0][0];
    expect(body.message).toBe('User is not properly authenticated');
    expect(body.error).toBe('Forbidden');
  });

  it('handles generic Error as 500 and logs', () => {
    const exception = new Error('Something broke');
    const res: any = makeMockRes();
    const req: any = makeMockReq('/test-url', 'DELETE');

    const host: any = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    };

    const errorSpy = vi.spyOn(Logger.prototype, 'error');

    filter.catch(exception, host as any);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(errorSpy).toHaveBeenCalled();
    const body = res.status().json.mock.calls[0][0];
    expect(body.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.message).toBe('Something broke');
  });

  describe('Prisma error handling', () => {
    const callFilterWithPrisma = (prismaError: any) => {
      const res: any = makeMockRes();
      const req: any = makeMockReq('/prisma', 'PUT');
      const host: any = {
        switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
      };
      // call catch
      filter.catch(prismaError, host as any);
      return { res };
    };

    it('maps P2000 to BadRequestException', () => {
      const e: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e.code = 'P2000';
      e.message = 'too long';
      const { res } = callFilterWithPrisma(e);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = res.status().json.mock.calls[0][0];
      expect(body.message).toContain('too long');
    });

    it('maps P2001/P2025 to NotFoundException', () => {
      const e1: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e1.code = 'P2001';
      e1.message = 'not found';
      const { res: r1 } = callFilterWithPrisma(e1);
      expect(r1.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

      const e2: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e2.code = 'P2025';
      e2.message = 'not found 2';
      const { res: r2 } = callFilterWithPrisma(e2);
      expect(r2.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('maps P2002 unique constraint with meta target to BadRequest with field', () => {
      const e: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e.code = 'P2002';
      e.message = 'unique';
      e.meta = { target: ['email'] };
      const { res } = callFilterWithPrisma(e);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = res.status().json.mock.calls[0][0];
      expect(body.message).toContain('email');
    });

    it('maps P2003 foreign key violation with message to BadRequest', () => {
      const e: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e.code = 'P2003';
      e.message = 'Foreign key constraint failed on the field: `fk_field`';
      const { res } = callFilterWithPrisma(e);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = res.status().json.mock.calls[0][0];
      expect(body.message).toContain('fk_field');
    });

    it('maps P2011 null constraint with meta to BadRequest', () => {
      const e: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e.code = 'P2011';
      e.meta = { target: ['name'] };
      const { res } = callFilterWithPrisma(e);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = res.status().json.mock.calls[0][0];
      expect(body.message).toContain('name');
    });

    it('maps P2014 to BadRequest', () => {
      const e: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e.code = 'P2014';
      const { res } = callFilterWithPrisma(e);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('handles unknown Prisma code by logging and returning 500', () => {
      const e: any = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      e.code = 'P9999';
      e.message = 'weird';
      const spy = vi.spyOn(Logger.prototype, 'error');
      const { res } = callFilterWithPrisma(e);
      expect(spy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('maps PrismaClientValidationError to BadRequest', () => {
      const e: any = Object.create(
        Prisma.PrismaClientValidationError.prototype,
      );
      e.message = 'validation failed';
      const { res } = callFilterWithPrisma(e);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('maps PrismaClientInitializationError to Service Unavailable and logs', () => {
      const e: any = Object.create(
        Prisma.PrismaClientInitializationError.prototype,
      );
      e.message = 'init fail';
      const spy = vi.spyOn(Logger.prototype, 'error');
      const { res } = callFilterWithPrisma(e);
      expect(spy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });

  describe('utility helpers', () => {
    it('extractFieldFromMeta returns joined target string or null', () => {
      const meta = { target: ['a', 'b'] } as any;
      const result = (filter as any).extractFieldFromMeta(meta);
      expect(result).toBe('a, b');
      expect((filter as any).extractFieldFromMeta({})).toBeNull();
    });

    it('extractForeignKeyField extracts field name from message', () => {
      const msg = 'Foreign key constraint failed on the field: `parent_id`';
      const result = (filter as any).extractForeignKeyField(msg);
      expect(result).toBe('parent_id');
      expect((filter as any).extractForeignKeyField('no match')).toBeNull();
    });
  });
});

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
