import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { from, Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { Request, Response } from "express";
import { ApiMetricsService } from "./api-metrics.service";
import { OperationNameUtil } from "./operation-name.util";

/**
 * Interceptor that captures API call metrics and publishes them to CloudWatch.
 */
@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly apiMetricsService: ApiMetricsService,
    private readonly operationNameUtil: OperationNameUtil,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const operation = this.operationNameUtil.get(context);

    return next.handle().pipe(
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
    const datums = this.apiMetricsService.buildMetricDatum(
      operation,
      method,
      status,
      latency,
    );
    await this.apiMetricsService.publish(datums);
  }
}
