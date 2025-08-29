import { RecreationResourceModule } from "@/recreation-resource/recreation-resource.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TerminusModule } from "@nestjs/terminus";
import { ClsModule } from "nestjs-cls";
import { ApiMetricsModule } from "./api-metrics/api-metrics.module";
import { AppConfigModule } from "./app-config/app-config.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth";
import { clsConfig } from "./common/cls.config";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [
    ClsModule.forRoot(clsConfig),
    AppConfigModule,
    PassportModule,
    AuthModule,
    TerminusModule,
    RecreationResourceModule,
    ApiMetricsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
