import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { globalValidationPipe } from '@/config/global-validation-pipe.config';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppConfigService } from './app-config/app-config.service';
import { AppModule } from './app.module';
import { createSwaggerActTokenProxyHandler } from './config/swagger-act-token-proxy.config';
import { setupAdminSwagger } from './config/swagger.config';
import { customLogger } from './common/logger.config';

const SWAGGER_ACT_TOKEN_PROXY_PATH = '/api/docs/oauth2/token';

/**
 * Bootstrap function to initialize the NestJS application.
 */
export async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: customLogger,
    });

  // CSS token URL is resolved from runtime config so Swagger reflects the
  // environment (dev / test / prod) the backend is currently running in.
  const appConfig = app.get(AppConfigService);
  const cssTokenUrl = appConfig.cssTokenUrl;

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          // Swagger now calls a same-origin proxy route for token exchange.
          connectSrc: ["'self'"],
        },
      },
    }),
  );
  app.enableCors();
  app.set('trust proxy', 1);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(globalValidationPipe);

  // global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // Same-origin proxy for the Act team's CSS OAuth2 Client Credentials token
  // exchange, so Swagger UI can call it without hitting CSS's CORS/CSP rules.
  app.use(
    SWAGGER_ACT_TOKEN_PROXY_PATH,
    createSwaggerActTokenProxyHandler(cssTokenUrl),
  );

  setupAdminSwagger(app, cssTokenUrl, SWAGGER_ACT_TOKEN_PROXY_PATH);

  return app;
}
