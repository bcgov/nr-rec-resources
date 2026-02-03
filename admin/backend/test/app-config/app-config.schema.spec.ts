import { EnvironmentVariables, validate } from '@/app-config/app-config.schema';
import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

// Mock class-validator
vi.mock('class-validator', async () => {
  const actual = await vi.importActual('class-validator');
  return {
    ...actual,
    validateSync: vi.fn().mockImplementation(actual.validateSync as any),
  };
});

describe('AppConfigSchema', () => {
  const validConfig = {
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'testuser',
    POSTGRES_PASSWORD: 'testpass',
    POSTGRES_DATABASE: 'testdb',
    POSTGRES_SCHEMA: 'public',
    KEYCLOAK_AUTH_SERVER_URL: 'http://localhost:8080/auth',
    KEYCLOAK_REALM: 'test-realm',
    KEYCLOAK_CLIENT_ID: 'test-client',
    KEYCLOAK_ISSUER: 'http://localhost:8080/auth/realms/test-realm',
    ESTABLISHMENT_ORDER_DOCS_BUCKET: 'test-establishment-order-docs-bucket',
    RST_STORAGE_IMAGES_BUCKET: 'test-rec-resource-images-bucket',
    RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET: 'test-rec-resource-docs-bucket',
    RST_STORAGE_CONSENT_FORMS_BUCKET: 'test-consent-forms-bucket',
    RST_STORAGE_CLOUDFRONT_URL: 'https://test-cdn.example.com',
    AWS_REGION: 'ca-central-1',
  };

  describe('validate function', () => {
    it('should successfully validate valid configuration', () => {
      const result = validate(validConfig);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.POSTGRES_PORT).toBe(5432);
      expect(typeof result.POSTGRES_PORT).toBe('number');
    });

    it('should transform string port to number', () => {
      const result = validate(validConfig);
      expect(result.POSTGRES_PORT).toBe(5432);
      expect(typeof result.POSTGRES_PORT).toBe('number');
    });

    it('should throw error when required field is missing', () => {
      const invalidConfig = { ...validConfig };
      // Remove a required field to test validation
      const { POSTGRES_HOST: _, ...configWithoutHost } = invalidConfig;

      expect(() => validate(configWithoutHost)).toThrow(
        'Configuration validation failed:',
      );
      expect(() => validate(configWithoutHost)).toThrow('POSTGRES_HOST:');
    });

    it('should throw error when field is empty string', () => {
      const invalidConfig = { ...validConfig, POSTGRES_HOST: '' };

      expect(() => validate(invalidConfig)).toThrow(
        'Configuration validation failed:',
      );
      expect(() => validate(invalidConfig)).toThrow('POSTGRES_HOST:');
    });

    it('should validate URLs properly', () => {
      // Test that valid URLs pass validation
      const result = validate(validConfig);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.KEYCLOAK_AUTH_SERVER_URL).toBe(
        'http://localhost:8080/auth',
      );
    });

    it('should validate port transformation', () => {
      // Test that string port gets transformed to number
      const configWithStringPort = {
        ...validConfig,
        POSTGRES_PORT: '5432', // String port
      };
      const result = validate(configWithStringPort);
      expect(result.POSTGRES_PORT).toBe(5432);
      expect(typeof result.POSTGRES_PORT).toBe('number');
    });

    it('should throw error with multiple validation failures', () => {
      const invalidConfig = {
        ...validConfig,
        POSTGRES_HOST: '',
        POSTGRES_PORT: 'invalid-port',
      };

      expect(() => validate(invalidConfig)).toThrow(
        'Configuration validation failed:',
      );
      const error = (() => {
        try {
          validate(invalidConfig);
          return null;
        } catch (e) {
          return e as Error;
        }
      })();

      expect(error?.message).toContain('POSTGRES_HOST:');
    });

    it('should allow localhost URLs without TLD', () => {
      const configWithLocalhostUrls = {
        ...validConfig,
        KEYCLOAK_AUTH_SERVER_URL: 'http://localhost:8080/auth',
        KEYCLOAK_ISSUER: 'http://localhost:8080/auth/realms/test',
      };

      const result = validate(configWithLocalhostUrls);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.KEYCLOAK_AUTH_SERVER_URL).toBe(
        'http://localhost:8080/auth',
      );
      expect(result.KEYCLOAK_ISSUER).toBe(
        'http://localhost:8080/auth/realms/test',
      );
    });

    it('should validate all Keycloak URL fields', () => {
      const result = validate(validConfig);
      expect(result.KEYCLOAK_AUTH_SERVER_URL).toBe(
        'http://localhost:8080/auth',
      );
      expect(result.KEYCLOAK_ISSUER).toBe(
        'http://localhost:8080/auth/realms/test-realm',
      );
    });

    it('should validate all database fields', () => {
      const result = validate(validConfig);
      expect(result.POSTGRES_HOST).toBe('localhost');
      expect(result.POSTGRES_USER).toBe('testuser');
      expect(result.POSTGRES_PASSWORD).toBe('testpass');
      expect(result.POSTGRES_DATABASE).toBe('testdb');
      expect(result.POSTGRES_SCHEMA).toBe('public');
    });

    it('should handle validation errors without constraints', () => {
      const invalidConfig = {
        ...validConfig,
        POSTGRES_HOST: null, // This should cause validation to fail
      };

      expect(() => validate(invalidConfig)).toThrow(
        'Configuration validation failed:',
      );
    });

    test('should handle edge case with undefined constraints', async () => {
      const { validateSync } = await import('class-validator');
      const mockValidateSync = vi.mocked(validateSync);

      mockValidateSync.mockReturnValueOnce([
        {
          property: 'testProperty',
          constraints: undefined, // This tests the edge case on line 117
        } as any,
      ]);

      expect(() => validate(validConfig)).toThrow(
        'Configuration validation failed:',
      );

      mockValidateSync.mockRestore();
    });

    it('should format error message with multiple errors separated by newlines', async () => {
      const { validateSync } = await import('class-validator');
      const mockValidateSync = vi.mocked(validateSync);

      mockValidateSync.mockReturnValueOnce([
        {
          property: 'RST_STORAGE_IMAGES_BUCKET',
          constraints: {
            isNotEmpty: 'RST_STORAGE_IMAGES_BUCKET should not be empty',
          },
        } as any,
        {
          property: 'RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET',
          constraints: {
            isNotEmpty:
              'RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET should not be empty',
          },
        } as any,
        {
          property: 'POSTGRES_HOST',
          constraints: {
            isNotEmpty: 'POSTGRES_HOST should not be empty',
          },
        } as any,
      ]);

      try {
        validate(validConfig);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('Configuration validation failed:');
        expect(errorMessage).toContain('POSTGRES_HOST:');
        expect(errorMessage).toContain('RST_STORAGE_IMAGES_BUCKET:');
        const lines = errorMessage.split('\n');
        expect(lines.length).toBeGreaterThan(1);
        expect(lines[0]).toBe('Configuration validation failed:');
      }

      mockValidateSync.mockRestore();
    });

    it('should format error message with multiple constraints per property', async () => {
      const { validateSync } = await import('class-validator');
      const mockValidateSync = vi.mocked(validateSync);

      mockValidateSync.mockReturnValueOnce([
        {
          property: 'KEYCLOAK_AUTH_SERVER_URL',
          constraints: {
            isUrl: 'KEYCLOAK_AUTH_SERVER_URL must be a URL address',
            isNotEmpty: 'KEYCLOAK_AUTH_SERVER_URL should not be empty',
          },
        } as any,
      ]);

      try {
        validate(validConfig);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('Configuration validation failed:');
        expect(errorMessage).toContain('KEYCLOAK_AUTH_SERVER_URL:');
        // Verify multiple constraints are joined with ', '
        expect(errorMessage).toContain(
          'KEYCLOAK_AUTH_SERVER_URL must be a URL address',
        );
        expect(errorMessage).toContain(
          'KEYCLOAK_AUTH_SERVER_URL should not be empty',
        );
        expect(errorMessage).toMatch(/KEYCLOAK_AUTH_SERVER_URL:.*,.*/);
      }

      mockValidateSync.mockRestore();
    });

    it('should handle error with empty constraints object', async () => {
      const { validateSync } = await import('class-validator');
      const mockValidateSync = vi.mocked(validateSync);

      mockValidateSync.mockReturnValueOnce([
        {
          property: 'testProperty',
          constraints: {}, // Empty object
        } as any,
      ]);

      try {
        validate(validConfig);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('Configuration validation failed:');
        expect(errorMessage).toContain('testProperty:');
        expect(errorMessage).toMatch(/testProperty:\s*$/);
      }

      mockValidateSync.mockRestore();
    });

    it('should format complex error message with multiple properties and constraints', async () => {
      const { validateSync } = await import('class-validator');
      const mockValidateSync = vi.mocked(validateSync);

      mockValidateSync.mockReturnValueOnce([
        {
          property: 'KEYCLOAK_AUTH_SERVER_URL',
          constraints: {
            isUrl: 'KEYCLOAK_AUTH_SERVER_URL must be a URL address',
            isNotEmpty: 'KEYCLOAK_AUTH_SERVER_URL should not be empty',
          },
        } as any,
        {
          property: 'POSTGRES_PORT',
          constraints: {
            isNumber: 'POSTGRES_PORT must be a number',
          },
        } as any,
        {
          property: 'testProperty',
          constraints: undefined,
        } as any,
      ]);

      try {
        validate(validConfig);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('Configuration validation failed:');

        expect(errorMessage).toContain('KEYCLOAK_AUTH_SERVER_URL:');
        expect(errorMessage).toContain('POSTGRES_PORT:');
        expect(errorMessage).toContain('testProperty:');

        expect(errorMessage).toContain(
          'KEYCLOAK_AUTH_SERVER_URL must be a URL address',
        );
        expect(errorMessage).toContain(
          'KEYCLOAK_AUTH_SERVER_URL should not be empty',
        );
        expect(errorMessage).toContain('POSTGRES_PORT must be a number');

        const lines = errorMessage.split('\n');
        expect(lines.length).toBeGreaterThan(3);
      }

      mockValidateSync.mockRestore();
    });
  });
});
