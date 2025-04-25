import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { customLogger } from "./common/logger.config";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { VersioningType } from "@nestjs/common";
import { MetricsInterceptor } from "./common/interceptors/metrics.interceptor";

/**
 *
 */
export async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: customLogger,
    });
  app.use(helmet());
  app.enableCors();
  app.set("trust proxy", 1);
  app.enableShutdownHooks();
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "v",
  });
  const config = new DocumentBuilder()
    .setTitle("Recreation Sites and Trails BC API")
    .setDescription("RST API documentation")
    .setVersion("1.0")
    .addTag("recreation-resource")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);

  // set up metrics interceptor to publish metrics
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new MetricsInterceptor(reflector));

  return app;
}
