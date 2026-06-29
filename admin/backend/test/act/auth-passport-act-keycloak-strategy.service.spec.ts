import { AppConfigModule } from '@/app-config/app-config.module';
import { AuthPassportActKeycloakStrategy } from '@/act/auth/auth-passport-act-keycloak.strategy';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

describe('AuthPassportActKeycloakStrategy', () => {
  const createModule = () => {
    return Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        AuthPassportActKeycloakStrategy,
        {
          provide: UserContextService,
          useValue: { setCurrentUser: vi.fn() },
        },
      ],
    }).compile();
  };

  it('should create strategy with valid configuration', async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportActKeycloakStrategy);
    expect(strategy).toBeDefined();
  });

  it('uses azp as the service account identifier when present', async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportActKeycloakStrategy);
    const userContext = module.get(UserContextService);

    const payload = {
      sub: 'sub-123',
      iss: 'issuer',
      idir_username: '',
      azp: 'act-client-azp',
      client_id: 'act-client-id',
      preferred_username: 'preferred',
    } as any;

    const result = await strategy.validate(payload);

    expect(result.idir_username).toBe('act-client-azp');
    expect(userContext.setCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({ idir_username: 'act-client-azp' }),
      'SERVICE',
    );
  });

  it('falls back to client_id when azp is missing', async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportActKeycloakStrategy);

    const payload = {
      sub: 'sub-123',
      iss: 'issuer',
      idir_username: '',
      client_id: 'act-client-id',
    } as any;

    const result = await strategy.validate(payload);

    expect(result.idir_username).toBe('act-client-id');
  });

  it('falls back to preferred_username and then sub', async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportActKeycloakStrategy);

    const preferredPayload = {
      sub: 'sub-123',
      iss: 'issuer',
      idir_username: '',
      preferred_username: 'service-account-username',
    } as any;

    const subPayload = {
      sub: 'sub-only-id',
      iss: 'issuer',
      idir_username: '',
    } as any;

    const preferredResult = await strategy.validate(preferredPayload);
    const subResult = await strategy.validate(subPayload);

    expect(preferredResult.idir_username).toBe('service-account-username');
    expect(subResult.idir_username).toBe('sub-only-id');
  });

  it('throws UnauthorizedException when no service account identifier can be resolved', async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportActKeycloakStrategy);
    const userContext = module.get(UserContextService);

    const payload = {
      sub: '',
      iss: 'issuer',
      idir_username: '',
      azp: 123,
      client_id: null,
      preferred_username: undefined,
    } as any;

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(userContext.setCurrentUser).not.toHaveBeenCalled();
  });
});
