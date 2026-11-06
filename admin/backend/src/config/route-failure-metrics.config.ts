import { ApiMetricsService } from '@shared/api/api-metrics/api-metrics.service';
import { NextFunction, Request, Response } from 'express';

/**
 * Records 4xx / 5xx responses on a route as CloudWatch failure metrics.
 *
 * Plain Express middleware rather than a Nest enhancer: guards run before
 * interceptors, so ApiMetricsInterceptor never sees 401 / 403. 'finish' catches
 * those plus validation errors, handler errors and 404s on unmatched subpaths.
 */
export function createRouteFailureMetricsHandler(
  route: string,
  apiMetricsService: ApiMetricsService,
) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        return;
      }

      // A throw in a 'finish' listener becomes an uncaught exception.
      try {
        void apiMetricsService
          .publish(
            apiMetricsService.buildRouteFailureDatums(route, res.statusCode),
          )
          .catch(() => undefined);
      } catch {
        /* noop */
      }
    });

    next();
  };
}
