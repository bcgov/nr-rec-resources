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
const SENSITIVE_FIELD_KEYS = new Set([
  'estimated_repair_cost',
  'actual_repair_cost',
  'recreation_agreement_holder',
]);

export function isIdirViewerOnly(roles: string[]): boolean {
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

/**
 * Targeted in-place redaction of sensitive fields.
 * Mutates the response object directly to avoid the cost of a deep clone.
 * Skips Date instances (typeof Date === 'object' but Dates have no plain keys).
 */
function redactSensitiveFields(data: unknown): void {
  if (Array.isArray(data)) {
    for (const item of data) {
      redactSensitiveFields(item);
    }
    return;
  }

  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const obj = data as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_FIELD_KEYS.has(key)) {
        obj[key] = null;
      } else {
        redactSensitiveFields(obj[key]);
      }
    }
  }
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

    return next.handle().pipe(
      map((data) => {
        redactSensitiveFields(data);
        return data;
      }),
    );
  }
}
