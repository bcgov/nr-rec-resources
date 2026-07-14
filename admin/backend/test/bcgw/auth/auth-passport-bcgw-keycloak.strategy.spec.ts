import { AppConfigModule } from '@/app-config/app-config.module';
import { AuthPassportBcgwKeycloakStrategy } from '@/bcgw/auth/auth-passport-bcgw-keycloak.strategy';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

describe('AuthPassportBcgwKeycloakStrategy', () => {
  const createModule = () => {
    return Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [AuthPassportBcgwKeycloakStrategy],
    }).compile();
  };

  it('should create the strategy with valid configuration', async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportBcgwKeycloakStrategy);
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('returns the JWT payload object unchanged', async () => {
      const module = await createModule();
      const strategy = module.get(AuthPassportBcgwKeycloakStrategy);

      const payload = { sub: 'bcgw-service-account', aud: 'bcgw-client-id' };

      const result = await strategy.validate(payload);

      expect(result).toBe(payload);
    });

    it('returns an empty payload unchanged', async () => {
      const module = await createModule();
      const strategy = module.get(AuthPassportBcgwKeycloakStrategy);

      const payload = {};

      const result = await strategy.validate(payload);

      expect(result).toBe(payload);
    });

    it('returns payload with multiple JWT claims unchanged', async () => {
      const module = await createModule();
      const strategy = module.get(AuthPassportBcgwKeycloakStrategy);

      const payload = {
        sub: 'abc123',
        aud: 'bcgw-client',
        iss: 'https://sso.example.com/realms/standard',
        azp: 'bcgw-service-account',
        exp: 9999999999,
        iat: 1700000000,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual(payload);
      expect(result).toBe(payload);
    });
  });
});
