import { RecreationResourceModule } from "@/recreation-resource/recreation-resource.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TerminusModule } from "@nestjs/terminus";
import { AppConfigModule } from "./app-config/app-config.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [
    AppConfigModule,
    PassportModule,
    AuthModule,
    TerminusModule,
    RecreationResourceModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
