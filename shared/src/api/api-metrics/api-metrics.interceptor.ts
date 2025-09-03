import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiMetricsService } from './api-metrics.service';
import { OperationNameUtil } from './operation-name.util';

/**
 * Interceptor that captures API call metrics and publishes them to CloudWatch.
 */
@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiMetricsInterceptor.name);

  constructor(
    private readonly apiMetricsService: ApiMetricsService,
    private readonly operationNameUtil: OperationNameUtil,
    private readonly cls: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const operation = this.operationNameUtil.get(context);
    const requestId = this.cls.getId();

    this.logger.log(
      `[API Metrics] Starting request: ${req.method} ${req.url} - Operation: ${operation}`,
    );

    // set request ID headers
    res.setHeader('rst-request-id', requestId);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `[API Metrics] Request completed successfully: ${req.method} ${req.url} - Status: ${res.statusCode}`,
        );
      }),
      switchMap((data) =>
        from(
          this.recordMetrics(operation, req.method, res.statusCode, start),
        ).pipe(switchMap(() => [data])),
      ),

      // On error, publish error metrics and rethrow error
      catchError((err) => {
        const status =
          err instanceof HttpException
            ? err.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        this.logger.error(
          `[API Metrics] Request failed: ${req.method} ${req.url} - Status: ${status} - Error: ${err.message}`,
        );

        return from(
          this.recordMetrics(operation, req.method, status, start),
        ).pipe(switchMap(() => throwError(() => err)));
      }),
    );
  }

  private async recordMetrics(
    operation: string,
    method: string,
    status: number,
    start: number,
  ): Promise<void> {
    const latency = Date.now() - start;

    this.logger.debug(
      `[API Metrics] Recording metrics - Operation: ${operation}, Method: ${method}, Status: ${status}, Latency: ${latency}ms`,
    );

    const datums = this.apiMetricsService.buildMetricDatum(
      operation,
      method,
      status,
      latency,
    );

    this.logger.debug(
      `[API Metrics] Built ${datums.length} metric datums for operation: ${operation}`,
    );

    await this.apiMetricsService.publish(datums);

    this.logger.debug(
      `[API Metrics] Successfully published metrics for operation: ${operation}`,
    );
  }
}
