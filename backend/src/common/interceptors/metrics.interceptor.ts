import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";
import { ApiOperationOptions } from "@nestjs/swagger";
import {
  CloudWatchClient,
  PutMetricDataCommand,
  StandardUnit,
} from "@aws-sdk/client-cloudwatch";

/**
 * Interceptor that captures and logs metrics for API operations to AWS CloudWatch.
 * Tracks request latency, status codes, and various request dimensions.
 * Uses Swagger's @ApiOperation decorator for operation naming when available.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly NAME_SPACE = "RecreationSitesAndTrailsBCAPI";
  private cloudWatchClient: CloudWatchClient;

  constructor(private readonly reflector: Reflector) {
    this.cloudWatchClient = new CloudWatchClient();
  }

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
    // Skip metrics during development
    if (process.env.NODE_ENV !== "development") {
      this.cloudWatchClient = new CloudWatchClient();
    }

    try {
      const timestamp = new Date();
      const statusCode = res.statusCode;

      const metricData = [
        {
          MetricName: "RequestLatency",
          Value: latency,
          Unit: StandardUnit.Milliseconds,
          Timestamp: timestamp,
          Dimensions: [
            { Name: "Operation", Value: operationName },
            { Name: "Method", Value: req.method },
            { Name: "StatusCode", Value: statusCode.toString() },
          ],
        },
        {
          MetricName: "RequestCount",
          Value: 1,
          Unit: StandardUnit.Count,
          Timestamp: timestamp,
          Dimensions: [
            { Name: "Operation", Value: operationName },
            { Name: "StatusCode", Value: statusCode.toString() },
          ],
        },
      ];

      if (statusCode >= 400) {
        metricData.push({
          MetricName: "ErrorCount",
          Value: 1,
          Unit: StandardUnit.Count,
          Timestamp: timestamp,
          Dimensions: [
            { Name: "Operation", Value: operationName },
            { Name: "ErrorType", Value: this.getErrorType(statusCode) },
          ],
        });
      }

      const command = new PutMetricDataCommand({
        Namespace: this.NAME_SPACE,
        MetricData: metricData,
      });

      await this.cloudWatchClient.send(command);
    } catch (err) {
      console.error("Failed to publish CloudWatch metrics:", err);
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
