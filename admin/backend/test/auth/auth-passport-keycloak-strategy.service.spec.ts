import { AppConfigModule } from '@/app-config/app-config.module';
import { AuthPassportKeycloakStrategy } from '@/auth';
import { RecreationResourceAuthRole } from '@/auth/auth.constants';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

describe('AuthPassportKeycloakStrategy', () => {
  const createModule = () => {
    const setCurrentUser = vi.fn();
    return Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        AuthPassportKeycloakStrategy,
        // Provide a minimal mock for UserContextService so strategy can be instantiated in tests
        {
          provide: UserContextService,
          useValue: { setCurrentUser },
        },
      ],
    })
      .compile()
      .then((module) => ({ module, setCurrentUser }));
  };

  it('should validate payload correctly', async () => {
    const { module, setCurrentUser } = await createModule();
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
      // include optional fields expected by KeycloakUserToken
      idir_username: 'TEST\\some.user',
    };

    expect(await strategy.validate(mockPayload)).toEqual({
      ...mockPayload,
      client_roles: [RecreationResourceAuthRole.RST_IDIR_VIEWER],
    });
    expect(setCurrentUser).toHaveBeenCalledWith({
      ...mockPayload,
      client_roles: [RecreationResourceAuthRole.RST_IDIR_VIEWER],
    });
  });

  it('does not append idir viewer role when IDIR already has an RST role', async () => {
    const { module } = await createModule();
    const strategy = module.get(AuthPassportKeycloakStrategy);

    const payload = {
      sub: '1234',
      idir_username: 'TEST\\admin.user',
      client_roles: [RecreationResourceAuthRole.RST_ADMIN],
    };

    await expect(strategy.validate(payload as any)).resolves.toEqual(payload);
  });

  it('does not append idir viewer role for non-IDIR users', async () => {
    const { module } = await createModule();
    const strategy = module.get(AuthPassportKeycloakStrategy);

    const payload = {
      sub: '1234',
      client_roles: [RecreationResourceAuthRole.RST_VIEWER],
    };

    await expect(strategy.validate(payload as any)).resolves.toEqual(payload);
  });

  describe('configuration validation', () => {
    it('should work with valid configuration', async () => {
      const { module } = await createModule();
      const strategy = module.get(AuthPassportKeycloakStrategy);
      expect(strategy).toBeDefined();
    });

    it('should create strategy with default settings', async () => {
      const { module } = await createModule();
      const strategy = module.get(AuthPassportKeycloakStrategy);
      expect(strategy).toBeDefined();
    });
  });
});
