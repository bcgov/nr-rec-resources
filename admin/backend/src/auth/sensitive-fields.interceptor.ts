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

// Large geospatial branches cannot contain the sensitive keys we redact.
const SKIP_DESCENT_KEYS = new Set(['geometry', 'shape', 'coordinates']);

function isTraversableObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null && typeof value === 'object' && !(value instanceof Date)
  );
}

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
  if (!isTraversableObject(data) && !Array.isArray(data)) {
    return;
  }

  const stack: unknown[] = [data];
  const visited = new WeakSet<object>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (Array.isArray(current)) {
      for (const item of current) {
        if (isTraversableObject(item) || Array.isArray(item)) {
          stack.push(item);
        }
      }
      continue;
    }

    if (!isTraversableObject(current)) {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    for (const [key, value] of Object.entries(current)) {
      if (SENSITIVE_FIELD_KEYS.has(key)) {
        current[key] = null;
        continue;
      }

      if (SKIP_DESCENT_KEYS.has(key)) {
        continue;
      }

      if (Array.isArray(value) || isTraversableObject(value)) {
        stack.push(value);
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
