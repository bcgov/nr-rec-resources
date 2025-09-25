import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_ROLES_KEY, ERROR_MESSAGES, ROLE_MODE } from './auth.constants';
import { KeycloakUserToken, RolesMetadata } from './auth.types';

/**
 * Guard that enforces role-based access control
 */
@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.getAllAndOverride<RolesMetadata>(
      AUTH_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!meta) {
      return true; // No roles required
    }

    const { roles: requiredRoles, mode } = meta;

    const request = context.switchToHttp().getRequest();
    const user = request.user as KeycloakUserToken;
    const userRoles = user.client_roles;

    if (!userRoles || !Array.isArray(userRoles)) {
      throw new ForbiddenException(ERROR_MESSAGES.NO_ROLES_FOUND);
    }

    const hasRoles =
      mode === ROLE_MODE.ALL
        ? requiredRoles.every((role) => userRoles.includes(role))
        : requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRoles) {
      throw new ForbiddenException(ERROR_MESSAGES.INSUFFICIENT_ROLES);
    }

    return true;
  }
}
