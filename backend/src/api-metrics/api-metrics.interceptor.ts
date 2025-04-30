import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";
import { ApiMetricsService } from "./api-metrics.service";
import { OperationNameUtil } from "./operation-name.util";

@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly metrics: ApiMetricsService,
    private readonly nameUtil: OperationNameUtil,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const operation = this.nameUtil.get(context);

    return next.handle().pipe(
      tap({
        next: async () => {
          const latency = Date.now() - start;
          const status = res.statusCode;
          const datums = this.metrics.buildDatums(
            operation,
            req.method,
            status,
            latency,
          );
          await this.metrics.publish(datums);
        },
        error: async (err) => {
          const latency = Date.now() - start;
          const status = err instanceof HttpException ? err.getStatus() : 500;
          const datums = this.metrics.buildDatums(
            operation,
            req.method,
            status,
            latency,
          );
          await this.metrics.publish(datums);
          throw err;
        },
      }),
    );
  }
}
