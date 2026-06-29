import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { globalValidationPipe } from '@/config/global-validation-pipe.config';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppConfigService } from './app-config/app-config.service';
import { AppModule } from './app.module';
import { AUTH_STRATEGY } from './auth';
import { customLogger } from './common/logger.config';
import { ACT_API_TAG } from './act/act.constants';

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

  // CSS token URL is resolved from runtime config so Swagger reflects the
  // environment (dev / test / prod) the backend is currently running in.
  const appConfig = app.get(AppConfigService);
  const cssTokenUrl = appConfig.cssTokenUrl;

  const config = new DocumentBuilder()
    .setTitle('Recreation Sites and Trails BC Admin API')
    .setDescription(
      'RST Admin API documentation.\n\n' +
        '## Act integration\n' +
        'Endpoints tagged **act** are the secure CUD (Create / Update / Delete) ' +
        'API consumed by the external Act system to push real-time advisory ' +
        'changes into `rst.act_advisories_flat`.\n\n' +
        '**Authentication:** OAuth2 *Client Credentials* grant flow via CSS ' +
        '(Common Hosted Single Sign-On).\n\n' +
        '1. The Act team retrieves their Client ID / Client Secret from the ' +
        'CSS dashboard.\n' +
        '2. They exchange those credentials at the CSS token endpoint to ' +
        `receive a short-lived bearer token (\`${cssTokenUrl}\`).\n` +
        '3. They include the token on every request as ' +
        '`Authorization: Bearer <token>`.\n' +
        '4. Tokens must carry the `act-service` client role. Missing, ' +
        'malformed, or expired tokens are rejected with **401**; tokens ' +
        'without the role are rejected with **403**.',
    )
    .setVersion('1.0')
    .addTag('recreation-resource-admin')
    .addTag(
      ACT_API_TAG,
      'Secure CUD endpoints consumed by the Act integration to push ' +
        'advisory changes into act_advisories_flat. Requires a CSS-issued ' +
        'OAuth2 Client Credentials bearer token carrying the act-service role.',
    )
    .addBearerAuth(
      {
        name: 'Authorization',
        description: 'Enter JWT token',
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      AUTH_STRATEGY.KEYCLOAK,
    )
    .addBearerAuth(
      {
        name: 'Authorization',
        description:
          'Act integration bearer token (CSS-issued JWT). Audience must ' +
          'match the Act CSS client. Use this scheme when manually pasting ' +
          'a token rather than running the Client Credentials flow.',
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      AUTH_STRATEGY.ACT_KEYCLOAK,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {
      // Persist the "Authorize" dialog selection across page reloads so the
      // Act team doesn't have to re-enter their CSS credentials each time.
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  return app;
}
