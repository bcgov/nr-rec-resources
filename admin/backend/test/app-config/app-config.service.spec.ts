import { validate } from '@/app-config/app-config.schema';
import { AppConfigService } from '@/app-config/app-config.service';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
          ignoreEnvFile: true, // Use vitest env variables
        }),
      ],
      providers: [AppConfigService],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Database Configuration', () => {
    it('should return database host', () => {
      expect(service.databaseHost).toBe('localhost');
    });

    it('should return database port as number', () => {
      expect(service.databasePort).toBe(5432);
      expect(typeof service.databasePort).toBe('number');
    });

    it('should return database user', () => {
      expect(service.databaseUser).toBe('test_user');
    });

    it('should return database password', () => {
      expect(service.databasePassword).toBe('test_password');
    });

    it('should return database name', () => {
      expect(service.databaseName).toBe('test_db');
    });

    it('should return database schema', () => {
      expect(service.databaseSchema).toBe('test_schema');
    });

    it('should construct database URL correctly', () => {
      const expectedUrl =
        'postgresql://test_user:test_password@localhost:5432/test_db?schema=test_schema&connection_limit=10';
      expect(service.databaseUrl).toBe(expectedUrl);
    });

    it('should encode special characters in password', async () => {
      vi.stubEnv('POSTGRES_PASSWORD', 'test@pass#123');

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            validate,
            ignoreEnvFile: true,
          }),
        ],
        providers: [AppConfigService],
      }).compile();

      const serviceWithSpecialPass =
        module.get<AppConfigService>(AppConfigService);
      const expectedUrl =
        'postgresql://test_user:test%40pass%23123@localhost:5432/test_db?schema=test_schema&connection_limit=10';
      expect(serviceWithSpecialPass.databaseUrl).toBe(expectedUrl);
    });
  });

  describe('Keycloak Configuration', () => {
    it('should return Keycloak auth server URL', () => {
      expect(service.keycloakAuthServerUrl).toBe(
        'https://test-keycloak.example.com/auth',
      );
    });

    it('should return Keycloak realm', () => {
      expect(service.keycloakRealm).toBe('test-realm');
    });

    it('should return Keycloak client ID', () => {
      expect(service.keycloakClientId).toBe('test-client');
    });

    it('should return Keycloak issuer', () => {
      expect(service.keycloakIssuer).toBe(
        'https://test-keycloak.example.com/auth/realms/test-realm',
      );
    });

    it('should build css token URL from issuer and strip trailing slashes', async () => {
      vi.stubEnv('KEYCLOAK_ISSUER', 'https://issuer.example.com/realms/dev///');

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            validate,
            ignoreEnvFile: true,
          }),
        ],
        providers: [AppConfigService],
      }).compile();

      const envService = module.get<AppConfigService>(AppConfigService);
      expect(envService.cssTokenUrl).toBe(
        'https://issuer.example.com/realms/dev/protocol/openid-connect/token',
      );
    });

    it('should return Act CSS client ID', () => {
      expect(service.actCssClientId).toBe('test-act-css-client');
    });
  });

  describe('BCGW Export Configuration', () => {
    /** Rebuilds the module so ConfigModule re-reads any stubbed env vars. */
    const buildService = async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            validate,
            ignoreEnvFile: true,
          }),
        ],
        providers: [AppConfigService],
      }).compile();

      return module.get<AppConfigService>(AppConfigService);
    };

    it('should return the BCGW exports bucket', () => {
      expect(service.bcgwExportsBucket).toBe('rst-bcgw-exports-dev');
    });

    it('should return undefined when the bucket is not configured', async () => {
      vi.stubEnv('BCGW_EXPORTS_BUCKET', undefined as unknown as string);

      expect((await buildService()).bcgwExportsBucket).toBeUndefined();
    });

    it('should report the export job disabled when the flag is unset', () => {
      expect(service.bcgwExportEnabled).toBe(false);
    });

    it('should report the export job enabled only for the exact string "true"', async () => {
      vi.stubEnv('BCGW_EXPORT_ENABLED', 'true');
      expect((await buildService()).bcgwExportEnabled).toBe(true);
    });

    it.each(['false', 'TRUE', '1'])(
      'should treat BCGW_EXPORT_ENABLED=%s as disabled',
      async (value) => {
        vi.stubEnv('BCGW_EXPORT_ENABLED', value);
        expect((await buildService()).bcgwExportEnabled).toBe(false);
      },
    );

    it('should default the cron to every 15 minutes', () => {
      expect(service.bcgwExportCron).toBe('*/15 * * * *');
    });

    it('should return a configured cron expression', async () => {
      vi.stubEnv('BCGW_EXPORT_CRON', '*/5 * * * *');
      expect((await buildService()).bcgwExportCron).toBe('*/5 * * * *');
    });
  });
});
