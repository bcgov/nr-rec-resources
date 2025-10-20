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
    DAM_RST_PDF_COLLECTION_ID: 'test-pdf-collection',
    DAM_RST_IMAGE_COLLECTION_ID: 'test-image-collection',
    DAM_URL: 'http://localhost:3001',
    DAM_USER: 'test-dam-user',
    DAM_PRIVATE_KEY: 'test-dam-private-key',
    DAM_RESOURCE_TYPE_PDF: '2',
    DAM_RESOURCE_TYPE_IMAGE: '3',
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
    AWS_REGION: 'ca-central-1',
  };

  describe('validate function', () => {
    it('should successfully validate valid configuration', () => {
      const result = validate(validConfig);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.DAM_URL).toBe('http://localhost:3001');
      expect(result.POSTGRES_PORT).toBe(5432);
      expect(typeof result.POSTGRES_PORT).toBe('number');
    });

    it('should transform string port to number', () => {
      const result = validate(validConfig);
      expect(result.POSTGRES_PORT).toBe(5432);
      expect(typeof result.POSTGRES_PORT).toBe('number');
    });

    it('should use default value 1 for DAM_RESOURCE_TYPE_PDF when not provided', () => {
      const configWithoutPdfType = {
        ...validConfig,
        DAM_RESOURCE_TYPE_PDF: undefined,
      };
      const result = validate(configWithoutPdfType);
      expect(result.DAM_RESOURCE_TYPE_PDF).toBe(1);
    });

    it('should use default value 1 for DAM_RESOURCE_TYPE_IMAGE when not provided', () => {
      const configWithoutImageType = {
        ...validConfig,
        DAM_RESOURCE_TYPE_IMAGE: undefined,
      };
      const result = validate(configWithoutImageType);
      expect(result.DAM_RESOURCE_TYPE_IMAGE).toBe(1);
    });

    it('should use default value 1 for DAM_RESOURCE_TYPE_PDF when invalid value provided', () => {
      const configWithInvalidPdfType = {
        ...validConfig,
        DAM_RESOURCE_TYPE_PDF: 'invalid',
      };
      const result = validate(configWithInvalidPdfType);
      expect(result.DAM_RESOURCE_TYPE_PDF).toBe(1);
    });

    it('should use default value 1 for DAM_RESOURCE_TYPE_IMAGE when invalid value provided', () => {
      const configWithInvalidImageType = {
        ...validConfig,
        DAM_RESOURCE_TYPE_IMAGE: 'invalid',
      };
      const result = validate(configWithInvalidImageType);
      expect(result.DAM_RESOURCE_TYPE_IMAGE).toBe(1);
    });

    it('should throw error when required field is missing', () => {
      const invalidConfig = { ...validConfig };
      // Remove a required field to test validation
      const { DAM_URL: _, ...configWithoutDamUrl } = invalidConfig;

      expect(() => validate(configWithoutDamUrl)).toThrow(
        'Configuration validation failed:',
      );
      expect(() => validate(configWithoutDamUrl)).toThrow('DAM_URL:');
    });

    it('should throw error when field is empty string', () => {
      const invalidConfig = { ...validConfig, DAM_RST_PDF_COLLECTION_ID: '' };

      expect(() => validate(invalidConfig)).toThrow(
        'Configuration validation failed:',
      );
      expect(() => validate(invalidConfig)).toThrow(
        'DAM_RST_PDF_COLLECTION_ID:',
      );
    });

    it('should validate URLs properly', () => {
      // Test that valid URLs pass validation
      const result = validate(validConfig);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.DAM_URL).toBe('http://localhost:3001');
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
        DAM_RST_PDF_COLLECTION_ID: '',
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

      expect(error?.message).toContain('DAM_RST_PDF_COLLECTION_ID:');
    });

    it('should allow localhost URLs without TLD', () => {
      const configWithLocalhostUrls = {
        ...validConfig,
        DAM_URL: 'http://localhost:3001',
        KEYCLOAK_AUTH_SERVER_URL: 'http://localhost:8080/auth',
        KEYCLOAK_ISSUER: 'http://localhost:8080/auth/realms/test',
      };

      const result = validate(configWithLocalhostUrls);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.DAM_URL).toBe('http://localhost:3001');
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

    it('should validate all DAM fields', () => {
      const result = validate(validConfig);
      expect(result.DAM_RST_PDF_COLLECTION_ID).toBe('test-pdf-collection');
      expect(result.DAM_RST_IMAGE_COLLECTION_ID).toBe('test-image-collection');
      expect(result.DAM_URL).toBe('http://localhost:3001');
    });

    it('should handle validation errors without constraints', () => {
      // Create a config that will definitely fail validation to test error handling
      const invalidConfig = {
        ...validConfig,
        DAM_URL: null, // This should cause validation to fail
      };

      expect(() => validate(invalidConfig)).toThrow(
        'Configuration validation failed:',
      );
    });

    test('should handle edge case with undefined constraints', async () => {
      // Import validateSync to mock it
      const { validateSync } = await import('class-validator');
      const mockValidateSync = vi.mocked(validateSync);

      // Mock validateSync to return an error with undefined constraints
      mockValidateSync.mockReturnValueOnce([
        {
          property: 'testProperty',
          constraints: undefined, // This tests the edge case on line 72
        } as any,
      ]);

      expect(() => validate(validConfig)).toThrow(
        'Configuration validation failed:',
      );

      // Restore the mock
      mockValidateSync.mockRestore();
    });
  });
});
