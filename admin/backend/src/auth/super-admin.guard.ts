import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RecreationResourceAuthRole } from './auth.constants';
import { KeycloakUserToken } from './auth.types';

/**
 * Guard that restricts an entire endpoint (or controller) to users with the
 * `rst-super-admin` role.  Apply it alongside the existing `AuthRolesGuard`
 * when a feature should be completely hidden from regular admins.
 *
 * @example — protect a single endpoint:
 * ```ts
 * @UseGuards(SuperAdminGuard)
 * @Delete(':id')
 * async delete(@Param('id') id: string) { ... }
 * ```
 *
 * @example — protect an entire controller:
 * ```ts
 * @UseGuards(AuthGuard('keycloak'), AuthRolesGuard, SuperAdminGuard)
 * @Controller('admin/super-only')
 * export class SuperOnlyController { ... }
 * ```
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user: KeycloakUserToken }>();
    const isSuperAdmin =
      request.user?.client_roles?.includes(
        RecreationResourceAuthRole.RST_SUPER_ADMIN,
      ) ?? false;

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        'This action requires the rst-super-admin role.',
      );
    }

    return true;
  }
}
