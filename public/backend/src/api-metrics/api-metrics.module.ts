import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiMetricsInterceptor } from "./api-metrics.interceptor";
import { ApiMetricsService } from "./api-metrics.service";
import { OperationNameUtil } from "./operation-name.util";

@Module({
  imports: [ConfigModule],
  providers: [
    ApiMetricsService,
    OperationNameUtil,
    {
      provide: "APP_INTERCEPTOR",
      useClass: ApiMetricsInterceptor,
    },
  ],
  exports: [ApiMetricsService],
})
export class ApiMetricsModule {}
