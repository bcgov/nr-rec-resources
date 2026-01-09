import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it, beforeEach } from 'vitest';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;

  const mockConfig = {
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: 5432,
    POSTGRES_USER: 'testuser',
    POSTGRES_PASSWORD: 'testpass',
    POSTGRES_DATABASE: 'testdb',
    POSTGRES_SCHEMA: 'rst',
    RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
    FOREST_CLIENT_API_URL: 'https://api.example.com',
    FOREST_CLIENT_API_KEY: 'test-api-key',
    PORT: 3000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => mockConfig[key as keyof typeof mockConfig],
          },
        },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  describe('database configuration', () => {
    it('should return databaseHost', () => {
      expect(service.databaseHost).toBe('localhost');
    });

    it('should return databasePort', () => {
      expect(service.databasePort).toBe(5432);
    });

    it('should return databaseUser', () => {
      expect(service.databaseUser).toBe('testuser');
    });

    it('should return databasePassword', () => {
      expect(service.databasePassword).toBe('testpass');
    });

    it('should return databaseName', () => {
      expect(service.databaseName).toBe('testdb');
    });

    it('should return databaseSchema', () => {
      expect(service.databaseSchema).toBe('rst');
    });

    it('should construct databaseUrl with schema', () => {
      const expectedUrl =
        'postgresql://testuser:testpass@localhost:5432/testdb?schema=rst&connection_limit=10';
      expect(service.databaseUrl).toBe(expectedUrl);
    });
  });

  describe('database URL encoding', () => {
    beforeEach(async () => {
      const specialPasswordConfig = {
        ...mockConfig,
        POSTGRES_PASSWORD: 'test@pass#with$special&chars',
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AppConfigService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string) =>
                specialPasswordConfig[
                  key as keyof typeof specialPasswordConfig
                ],
            },
          },
        ],
      }).compile();

      service = module.get<AppConfigService>(AppConfigService);
    });

    it('should encode special characters in password', () => {
      const url = service.databaseUrl;
      expect(url).toContain('test%40pass%23with%24special%26chars');
    });
  });

  describe('CloudFront configuration', () => {
    it('should return rstStorageCloudfrontUrl', () => {
      expect(service.rstStorageCloudfrontUrl).toBe('https://cdn.example.com');
    });
  });

  describe('Forest Client API configuration', () => {
    it('should return forestClientApiUrl', () => {
      expect(service.forestClientApiUrl).toBe('https://api.example.com');
    });

    it('should return forestClientApiKey', () => {
      expect(service.forestClientApiKey).toBe('test-api-key');
    });
  });

  describe('server configuration', () => {
    it('should return port', () => {
      expect(service.port).toBe(3000);
    });
  });
});
