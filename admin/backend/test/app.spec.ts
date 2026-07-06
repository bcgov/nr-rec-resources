import { VersioningType } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_STRATEGY } from '@/auth';
import { ACT_API_TAG } from '@/act/act.constants';

const helmetMiddleware = vi.fn();
const helmetMock = vi.fn(() => helmetMiddleware);
(
  helmetMock as unknown as {
    contentSecurityPolicy: { getDefaultDirectives: () => unknown };
  }
).contentSecurityPolicy = {
  getDefaultDirectives: vi.fn(() => ({ defaultSrc: ["'self'"] })),
};

const appMock = {
  use: vi.fn(),
  enableCors: vi.fn(),
  set: vi.fn(),
  enableShutdownHooks: vi.fn(),
  setGlobalPrefix: vi.fn(),
  useGlobalPipes: vi.fn(),
  useGlobalFilters: vi.fn(),
  enableVersioning: vi.fn(),
  get: vi.fn(),
};

const createDocumentMock = vi.fn();
const setupSwaggerMock = vi.fn();

const builderMocks = {
  setTitle: vi.fn(),
  setDescription: vi.fn(),
  setVersion: vi.fn(),
  addTag: vi.fn(),
  addBearerAuth: vi.fn(),
  build: vi.fn(),
};

vi.mock('helmet', () => ({
  default: helmetMock,
}));

vi.mock('@/common/logger.config', () => ({
  customLogger: { log: vi.fn() },
}));

vi.mock('@/config/global-validation-pipe.config', () => ({
  globalValidationPipe: { _pipe: 'validation' },
}));

vi.mock('@/common/filters/all-exceptions.filter', () => ({
  AllExceptionsFilter: class MockAllExceptionsFilter {},
}));

vi.mock('@nestjs/core', async () => {
  const actual =
    await vi.importActual<typeof import('@nestjs/core')>('@nestjs/core');
  return {
    ...actual,
    NestFactory: {
      create: vi.fn(async () => appMock),
    },
  };
});

vi.mock('@nestjs/swagger', async () => {
  const actual =
    await vi.importActual<typeof import('@nestjs/swagger')>('@nestjs/swagger');
  return {
    ...actual,
    DocumentBuilder: class MockDocumentBuilder {
      setTitle(title: string) {
        builderMocks.setTitle(title);
        return this;
      }
      setDescription(description: string) {
        builderMocks.setDescription(description);
        return this;
      }
      setVersion(version: string) {
        builderMocks.setVersion(version);
        return this;
      }
      addTag(name: string, description?: string) {
        builderMocks.addTag(name, description);
        return this;
      }
      addBearerAuth(options: unknown, key: string) {
        builderMocks.addBearerAuth(options, key);
        return this;
      }
      build() {
        builderMocks.build();
        return { mocked: true };
      }
    },
    SwaggerModule: {
      ...actual.SwaggerModule,
      createDocument: createDocumentMock,
      setup: setupSwaggerMock,
    },
  };
});

describe('bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appMock.get.mockReturnValue({
      cssTokenUrl:
        'https://test-keycloak.example.com/auth/realms/test-realm/protocol/openid-connect/token',
    });
    createDocumentMock.mockReturnValue({ openapi: '3.0.0' });
  });

  it('configures Nest app and Swagger with Act auth settings', async () => {
    const { bootstrap } = await import('@/app');

    const app = await bootstrap();

    expect(helmetMock).toHaveBeenCalledTimes(1);
    expect(appMock.use).toHaveBeenCalledWith(helmetMiddleware);
    expect(appMock.use).toHaveBeenCalledWith(
      '/api/docs/oauth2/token',
      expect.any(Function),
    );
    expect(appMock.enableCors).toHaveBeenCalledTimes(1);
    expect(appMock.set).toHaveBeenCalledWith('trust proxy', 1);
    expect(appMock.enableShutdownHooks).toHaveBeenCalledTimes(1);
    expect(appMock.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(appMock.useGlobalPipes).toHaveBeenCalledWith({
      _pipe: 'validation',
    });
    expect(appMock.useGlobalFilters).toHaveBeenCalledTimes(1);
    expect(appMock.enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
      prefix: 'v',
    });

    expect(appMock.get).toHaveBeenCalledTimes(1);

    expect(builderMocks.setTitle).toHaveBeenCalledWith(
      'Recreation Sites and Trails BC Admin API',
    );
    expect(builderMocks.setVersion).toHaveBeenCalledWith('1.0');
    expect(builderMocks.setDescription).toHaveBeenCalledWith(
      expect.stringContaining('protocol/openid-connect/token'),
    );
    expect(builderMocks.addTag).toHaveBeenCalledWith(
      ACT_API_TAG,
      expect.stringContaining(
        'Secure CUD endpoints consumed by the Act integration',
      ),
    );
    expect(builderMocks.addBearerAuth).toHaveBeenCalledWith(
      expect.any(Object),
      AUTH_STRATEGY.KEYCLOAK,
    );

    expect(createDocumentMock).toHaveBeenCalledWith(
      appMock,
      expect.objectContaining({ mocked: true }),
    );
    expect(setupSwaggerMock).toHaveBeenCalledWith(
      '/api/docs',
      appMock,
      expect.objectContaining({
        components: expect.objectContaining({
          securitySchemes: expect.objectContaining({
            [AUTH_STRATEGY.ACT_KEYCLOAK]: expect.objectContaining({
              flows: expect.objectContaining({
                clientCredentials: expect.objectContaining({
                  tokenUrl: '/api/docs/oauth2/token',
                }),
              }),
            }),
          }),
        }),
      }),
      {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      },
    );
    expect(setupSwaggerMock).toHaveBeenCalledWith(
      '/api/docs',
      appMock,
      expect.any(Object),
      {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      },
    );

    expect(app).toBe(appMock);
  });
});
