import { UnauthorizedUserException } from '@/common/exceptions/unauthorized-user.exception';
import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

describe('UnauthorizedUserException', () => {
  it('should create an exception with correct message and status', () => {
    const exception = new UnauthorizedUserException();

    expect(exception.message).toBe('User is not properly authenticated');
    expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(exception.name).toBe('UnauthorizedUserException');
  });

  it('should be an instance of HttpException', () => {
    const exception = new UnauthorizedUserException();

    expect(exception).toBeInstanceOf(Error);
  });

  it('should have a getResponse method that returns the message', () => {
    const exception = new UnauthorizedUserException();
    const response = exception.getResponse();

    expect(response).toBe('User is not properly authenticated');
  });
});
