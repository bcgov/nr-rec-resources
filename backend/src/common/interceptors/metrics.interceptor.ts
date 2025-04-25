import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap } from "rxjs";
import { createMetricsLogger, Unit } from "aws-embedded-metrics";
import { Request, Response } from "express";
import { ApiOperationOptions } from "@nestjs/swagger";

/**
 * Interceptor that captures and logs metrics for API operations to AWS CloudWatch.
 * Tracks request latency, status codes, and various request dimensions.
 * Uses Swagger's @ApiOperation decorator for operation naming when available.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly NAME_SPACE = "RecreationSitesAndTrailsBCAPI";

  constructor(private readonly reflector: Reflector) {}

  private getOperationName(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();

    const apiOperation = this.reflector.get<ApiOperationOptions>(
      "swagger/apiOperation",
      handler,
    );

    return apiOperation?.operationId || `${controller.name}.${handler.name}`;
  }

  private async logMetrics(
    operationName: string,
    req: Request,
    res: Response,
    latency: number,
  ): Promise<void> {
    const metrics = createMetricsLogger();

    const statusCode = res.statusCode;

    metrics.setNamespace(this.NAME_SPACE);
    metrics.putMetric("Latency", latency, Unit.Milliseconds);
    metrics.putMetric(`StatusCode_${statusCode}`, 1, Unit.Count);

    // Set dimensions and properties
    metrics.setDimensions({
      Operation: operationName,
      Method: req.method,
      StatusCode: statusCode.toString(),
    });

    metrics.setProperty("UserAgent", req.headers["user-agent"]);
    metrics.setProperty("ClientIp", req.ip);
    metrics.setProperty("Path", req.path);

    // Track errors
    if (statusCode >= 400) {
      metrics.putMetric("ErrorCount", 1, Unit.Count);
      metrics.setProperty("ErrorType", this.getErrorType(statusCode));
    }

    try {
      await metrics.flush();
    } catch (err) {
      console.error("Failed to flush CloudWatch metrics:", err);
    }
  }

  private getErrorType(statusCode: number): string {
    if (statusCode >= 500) return "ServerError";
    if (statusCode >= 400) return "ClientError";
    return "Unknown";
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const startTime = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const operationName = this.getOperationName(context);

    return next.handle().pipe(
      tap(async () => {
        const latency = Date.now() - startTime;
        await this.logMetrics(operationName, req, res, latency);
      }),
    );
  }
}
