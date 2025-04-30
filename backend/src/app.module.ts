import "dotenv/config";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { HTTPLoggerMiddleware } from "./middleware/req.res.logger";
import { PrismaService } from "src/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { MetricsController } from "./metrics.controller";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { RecreationResourceModule } from "./recreation-resource/recreation-resource.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MetricsInterceptor } from "./common/interceptors/metrics.interceptor";

@Module({
  imports: [ConfigModule.forRoot(), TerminusModule, RecreationResourceModule],
  controllers: [AppController, MetricsController, HealthController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {
  // let's add a middleware on all routes
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HTTPLoggerMiddleware)
      .exclude(
        { path: "metrics", method: RequestMethod.ALL },
        { path: "health", method: RequestMethod.ALL },
      )
      .forRoutes("*");
  }
}
