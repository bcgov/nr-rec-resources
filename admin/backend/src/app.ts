import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { globalValidationPipe } from '@/config/global-validation-pipe.config';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { text as readStreamText } from 'node:stream/consumers';
import helmet from 'helmet';
import { AppConfigService } from './app-config/app-config.service';
import { AppModule } from './app.module';
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
    async (req: Request, res: Response): Promise<void> => {
      if (req.method === 'OPTIONS') return void res.sendStatus(204);
      if (req.method !== 'POST')
        return void res.status(405).json({ error: 'method_not_allowed' });

      const contentType = req.header('content-type') ?? '';
      if (!contentType.includes('application/x-www-form-urlencoded'))
        return void res.status(415).json({ error: 'unsupported_media_type' });

      // req.body is normally already parsed to an object by Nest's built-in
      // body parser. The raw-stream re-read below is a fallback only —
      // remove it if you've confirmed the body parser always runs first.
      const params = new URLSearchParams(
        typeof req.body === 'string'
          ? req.body
          : req.body && typeof req.body === 'object'
            ? (req.body as Record<string, string>)
            : await readStreamText(req),
      );

      if (params.get('grant_type') !== 'client_credentials')
        return void res.status(400).json({ error: 'unsupported_grant_type' });

      const authorization = req.header('authorization');

      try {
        const upstream = await fetch(cssTokenUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            ...(authorization && { authorization }),
          },
          body: params.toString(),
        });

        const upstreamContentType = upstream.headers.get('content-type');
        if (upstreamContentType) {
          res.setHeader('content-type', upstreamContentType);
        }

        res.status(upstream.status).send(await upstream.text());
      } catch {
        res.status(502).json({ error: 'token_exchange_failed' });
      }
    },
  );

  setupAdminSwagger(app, cssTokenUrl, SWAGGER_ACT_TOKEN_PROXY_PATH);

  return app;
}
