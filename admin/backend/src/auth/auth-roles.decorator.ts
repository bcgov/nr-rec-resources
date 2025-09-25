import { SetMetadata } from '@nestjs/common';
import { AUTH_ROLES_KEY, ROLE_MODE } from './auth.constants';
import { RoleMode, RolesMetadata } from './auth.types';

/**
 * Decorator for role-based authorization
 * @param roles Array of roles required for access
 * @param mode Validation mode ('any' or 'all')
 */
export const AuthRoles = (roles: string[], mode: RoleMode = ROLE_MODE.ANY) =>
  SetMetadata<string, RolesMetadata>(AUTH_ROLES_KEY, { roles, mode });
