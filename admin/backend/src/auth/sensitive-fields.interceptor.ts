import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KeycloakUserToken } from './auth.types';
import { RecreationResourceAuthRole } from './auth.constants';

/**
 * Fields redacted from responses when the user holds only the IDIR_VIEWER role.
 * These correspond to the sensitive-information restrictions in AC3 and AC4.
 */
const REPAIR_COST_FIELDS = ['estimated_repair_cost', 'actual_repair_cost'];
const AGREEMENT_HOLDER_FIELD = 'recreation_agreement_holder';

function isIdirViewerOnly(roles: string[]): boolean {
  const rstRoles = Object.values(RecreationResourceAuthRole).filter(
    (r) => r !== RecreationResourceAuthRole.ACT_SERVICE,
  );
  return (
    roles.includes(RecreationResourceAuthRole.RST_IDIR_VIEWER) &&
    !rstRoles
      .filter((r) => r !== RecreationResourceAuthRole.RST_IDIR_VIEWER)
      .some((r) => roles.includes(r))
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function redactSensitiveFields(data: any): unknown {
  if (Array.isArray(data)) {
    return data.map(redactSensitiveFields);
  }

  if (data !== null && typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (REPAIR_COST_FIELDS.includes(key)) {
        result[key] = null;
      } else if (key === AGREEMENT_HOLDER_FIELD) {
        result[key] = null;
      } else {
        result[key] = redactSensitiveFields(value);
      }
    }
    return result;
  }

  return data;
}

/**
 * Interceptor that redacts sensitive fields from API responses for users who
 * only hold the `rst-idir-viewer` role (AC3 & AC4).
 *
 * Apply at the controller class or individual GET handler level:
 *
 * ```ts
 * \@UseInterceptors(SensitiveFieldsInterceptor)
 * ```
 */
@Injectable()
export class SensitiveFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as KeycloakUserToken | undefined;

    if (!user) {
      return next.handle();
    }

    const roles: string[] = user.client_roles ?? [];

    if (!isIdirViewerOnly(roles)) {
      return next.handle();
    }

    return next.handle().pipe(map(redactSensitiveFields));
  }
}
