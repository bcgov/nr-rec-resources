import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PassportModule } from "@nestjs/passport";
import { AuthModule } from "./auth";
import { PrismaService } from "./prisma.service";
import { RecreationResourceModule } from "@/recreation-resource/recreation-resource.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    AuthModule,
    TerminusModule,
    RecreationResourceModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
