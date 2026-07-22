import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('passport-keycloak-bearer', () => ({
  default: class {
    constructor(_opts: unknown) {}
  },
}));

vi.mock('@nestjs/passport', () => ({
  PassportStrategy: (_Strategy: unknown, _name?: string) => {
    return class {
      constructor(..._args: unknown[]) {}
    };
  },
  AuthGuard: vi.fn(),
}));

import { AuthPassportBcgwKeycloakStrategy } from './auth-passport-bcgw-keycloak.strategy';
import { AppConfigService } from '@/app-config/app-config.service';

const makeAppConfig = (): Partial<AppConfigService> => ({
  keycloakRealm: 'standard',
  keycloakAuthServerUrl: 'https://sso.example.com/auth',
  keycloakIssuer: 'https://sso.example.com/auth/realms/standard',
  bcgwCssClientId: 'bcgw-test-client',
});

describe('AuthPassportBcgwKeycloakStrategy', () => {
  let strategy: AuthPassportBcgwKeycloakStrategy;

  beforeEach(() => {
    strategy = new AuthPassportBcgwKeycloakStrategy(
      makeAppConfig() as AppConfigService,
    );
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('returns the payload object unchanged', async () => {
      const payload = { sub: 'service-account-bcgw', aud: 'bcgw-test-client' };

      const result = await strategy.validate(payload);

      expect(result).toBe(payload);
    });

    it('returns an empty payload unchanged', async () => {
      const payload = {};

      const result = await strategy.validate(payload);

      expect(result).toBe(payload);
    });

    it('returns payload with multiple JWT claims unchanged', async () => {
      const payload = {
        sub: 'abc123',
        aud: 'bcgw-test-client',
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
