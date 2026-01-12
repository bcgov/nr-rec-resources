import { validate } from '@/app-config/app-config.schema';
import { AppConfigService } from '@/app-config/app-config.service';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

      vi.unstubAllEnvs();
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
  });
});
