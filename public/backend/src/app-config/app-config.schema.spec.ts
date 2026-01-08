import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { validate } from './app-config.schema';

describe('AppConfigSchema', () => {
  describe('validate', () => {
    it('should pass validation with valid environment variables', () => {
      const validConfig = {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DATABASE: 'testdb',
        RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
        FOREST_CLIENT_API_URL: 'https://api.example.com',
        FOREST_CLIENT_API_KEY: 'test-api-key',
      };

      expect(() => validate(validConfig)).not.toThrow();
    });

    it('should pass validation with optional POSTGRES_SCHEMA', () => {
      const validConfig = {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DATABASE: 'testdb',
        POSTGRES_SCHEMA: 'rst',
        RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
        FOREST_CLIENT_API_URL: 'https://api.example.com',
        FOREST_CLIENT_API_KEY: 'test-api-key',
      };

      const result = validate(validConfig);
      expect(result.POSTGRES_SCHEMA).toBe('rst');
    });

    it('should pass with optional PORT', () => {
      const validConfig = {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DATABASE: 'testdb',
        RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
        FOREST_CLIENT_API_URL: 'https://api.example.com',
        FOREST_CLIENT_API_KEY: 'test-api-key',
        PORT: '3000',
      };

      const result = validate(validConfig);
      expect(result.PORT).toBe(3000);
    });

    it('should throw error when POSTGRES_HOST is missing', () => {
      const invalidConfig = {
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DATABASE: 'testdb',
        RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
        FOREST_CLIENT_API_URL: 'https://api.example.com',
        FOREST_CLIENT_API_KEY: 'test-api-key',
      };

      expect(() => validate(invalidConfig)).toThrow();
    });

    it('should throw error when FOREST_CLIENT_API_KEY is missing', () => {
      const invalidConfig = {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DATABASE: 'testdb',
        RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
        FOREST_CLIENT_API_URL: 'https://api.example.com',
      };

      expect(() => validate(invalidConfig)).toThrow();
    });

    it('should transform POSTGRES_PORT to number', () => {
      const validConfig = {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5433',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DATABASE: 'testdb',
        RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
        FOREST_CLIENT_API_URL: 'https://api.example.com',
        FOREST_CLIENT_API_KEY: 'test-api-key',
      };

      const result = validate(validConfig);
      expect(result.POSTGRES_PORT).toBe(5433);
      expect(typeof result.POSTGRES_PORT).toBe('number');
    });

    it('should default POSTGRES_PORT to 5432 when invalid', () => {
      const validConfig = {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: 'invalid',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DATABASE: 'testdb',
        RST_STORAGE_CLOUDFRONT_URL: 'https://cdn.example.com',
        FOREST_CLIENT_API_URL: 'https://api.example.com',
        FOREST_CLIENT_API_KEY: 'test-api-key',
      };

      const result = validate(validConfig);
      expect(result.POSTGRES_PORT).toBe(5432);
    });
  });
});
