import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ACT_API_TAG } from '@/act/act.constants';
import { AUTH_STRATEGY } from '@/auth';

export function setupAdminSwagger(
  app: NestExpressApplication,
  cssTokenUrl: string,
  actTokenProxyPath: string,
): void {
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
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.components ??= {};
  document.components.securitySchemes ??= {};
  document.components.securitySchemes[AUTH_STRATEGY.ACT_KEYCLOAK] = {
    type: 'oauth2',
    description:
      'Act integration OAuth2 Client Credentials flow via CSS. Enter the ' +
      'CSS Client ID and Client Secret and Swagger UI will request a bearer ' +
      'token from the configured token endpoint automatically.',
    flows: {
      clientCredentials: {
        tokenUrl: actTokenProxyPath,
        scopes: {},
      },
    },
  };

  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {
      // Persist the "Authorize" dialog selection across page reloads so the
      // Act team doesn't have to re-enter their CSS credentials each time.
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
