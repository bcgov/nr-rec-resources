import { AppConfigModule } from '@/app-config/app-config.module';
import { AuthPassportKeycloakStrategy } from '@/auth';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

describe('AuthPassportKeycloakStrategy', () => {
  const createModule = () => {
    return Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [AuthPassportKeycloakStrategy],
    }).compile();
  };

  it('should validate payload correctly', async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportKeycloakStrategy);
    const mockPayload = {
      sub: '1234',
      roles: ['user'],
      iss: 'http://localhost:8080/auth/realms/test-realm',
      aud: 'test-client',
      exp: 1234567890,
      iat: 1234567890,
      auth_time: 1234567890,
      jti: 'test-jti',
      typ: 'Bearer',
    };

    expect(await strategy.validate(mockPayload)).toEqual(mockPayload);
  });

  describe('configuration validation', () => {
    it('should work with valid configuration', async () => {
      const module = await createModule();
      const strategy = module.get(AuthPassportKeycloakStrategy);
      expect(strategy).toBeDefined();
    });

    it('should create strategy with default settings', async () => {
      const module = await createModule();
      const strategy = module.get(AuthPassportKeycloakStrategy);
      expect(strategy).toBeDefined();
    });
  });
});
