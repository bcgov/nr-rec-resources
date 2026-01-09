import { NestExpressApplication } from '@nestjs/platform-express';
import { bootstrap } from './app';

vi.mock('src/app-config/app-config.schema', () => ({
  validate: () => ({
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: 5432,
    POSTGRES_USER: 'test',
    POSTGRES_PASSWORD: 'test',
    POSTGRES_DATABASE: 'test',
    RST_STORAGE_CLOUDFRONT_URL: 'http://example.com',
    FOREST_CLIENT_API_URL: 'http://localhost:3001',
    FOREST_CLIENT_API_KEY: 'test-api-key',
  }),
}));

vi.mock('prom-client', () => ({
  Registry: vi.fn().mockImplementation(() => ({})),
  collectDefaultMetrics: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('express-prom-bundle', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('src/middleware/prom', () => ({
  metricsMiddleware: vi.fn().mockImplementation((_req, _res, next) => next()),
}));

describe('main', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await bootstrap();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should start the application', async () => {
    expect(app).toBeDefined();
  });
});
