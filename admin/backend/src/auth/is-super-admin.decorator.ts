import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RecreationResourceAuthRole } from './auth.constants';
import { KeycloakUserToken } from './auth.types';

/**
 * Parameter decorator that resolves to `true` when the authenticated user
 * has the `rst-super-admin` role, and `false` otherwise.
 *
 * Use this when a handler needs to branch on super-admin status without
 * blocking the request entirely.
 *
 * @example
 * ```ts
 * async search(@IsSuperAdmin() isSuperAdmin: boolean) {
 *   return this.service.search({ includeArchived: isSuperAdmin });
 * }
 * ```
 */
export const IsSuperAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: KeycloakUserToken }>();
    return (
      request.user?.client_roles?.includes(
        RecreationResourceAuthRole.RST_SUPER_ADMIN,
      ) ?? false
    );
  },
);
