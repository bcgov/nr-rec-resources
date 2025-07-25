import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { customLogger } from "./common/logger.config";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { VersioningType } from "@nestjs/common";
import { AUTH_STRATEGY } from "./auth";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { globalValidationPipe } from "@/config/global-validation-pipe.config";

/**
 * Bootstrap function to initialize the NestJS application.
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
  app.useGlobalPipes(globalValidationPipe);

  // global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "v",
  });
  const config = new DocumentBuilder()
    .setTitle("Recreation Sites and Trails BC Admin API")
    .setDescription("RST Admin API documentation")
    .setVersion("1.0")
    .addTag("recreation-resource-admin")
    .addBearerAuth(
      {
        name: "Authorization",
        description: "Enter JWT token",
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header",
      },
      AUTH_STRATEGY.KEYCLOAK,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);

  return app;
}
