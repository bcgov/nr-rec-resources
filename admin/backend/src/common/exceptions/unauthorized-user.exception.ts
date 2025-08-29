// src/common/exceptions/unauthorized-user.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedUserException extends HttpException {
  constructor() {
    super('User is not properly authenticated', HttpStatus.FORBIDDEN);
    this.name = 'UnauthorizedUserException';
  }
}
