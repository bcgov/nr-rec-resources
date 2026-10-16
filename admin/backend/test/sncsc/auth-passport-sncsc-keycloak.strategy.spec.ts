import { AppConfigService } from '@/app-config/app-config.service';
import { KeycloakUserToken } from '@/auth/auth.types';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { AuthPassportSncscKeycloakStrategy } from '@/sncsc/auth/auth-passport-sncsc-keycloak.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

describe('AuthPassportSncscKeycloakStrategy', () => {
  const createStrategy = () => {
    const appConfig = {
      keycloakRealm: 'test-realm',
      keycloakAuthServerUrl: 'http://localhost:8080/auth',
      keycloakIssuer: 'http://localhost:8080/auth/realms/test-realm',
      sncscCssClientId: 'sncsc-css-client',
    } as AppConfigService;

    const setCurrentUser = vi.fn();
    const userContextService = {
      setCurrentUser,
    } as unknown as UserContextService;

    const strategy = new AuthPassportSncscKeycloakStrategy(
      appConfig,
      userContextService,
    );

    return { strategy, setCurrentUser };
  };

  it('uses azp as the service account identifier when present', async () => {
    const { strategy, setCurrentUser } = createStrategy();

    const payload = {
      sub: 'sub-id',
      iss: 'http://localhost:8080/auth/realms/test-realm',
      azp: 'sncsc-service-account',
      client_id: 'fallback-client-id',
      preferred_username: 'fallback-username',
    } as KeycloakUserToken;

    await expect(strategy.validate(payload)).resolves.toEqual({
      ...payload,
      idir_username: 'sncsc-service-account',
    });

    expect(setCurrentUser).toHaveBeenCalledWith(
      {
        ...payload,
        idir_username: 'sncsc-service-account',
      },
      'SERVICE',
    );
  });

  it('falls back to client_id, preferred_username, and sub in order', async () => {
    const { strategy, setCurrentUser } = createStrategy();

    await expect(
      strategy.validate({
        sub: 'sub-fallback',
        iss: 'http://localhost:8080/auth/realms/test-realm',
        client_id: 'client-id-only',
      } as KeycloakUserToken),
    ).resolves.toMatchObject({ idir_username: 'client-id-only' });

    await expect(
      strategy.validate({
        sub: 'sub-fallback',
        iss: 'http://localhost:8080/auth/realms/test-realm',
        preferred_username: 'preferred-user-only',
      } as KeycloakUserToken),
    ).resolves.toMatchObject({ idir_username: 'preferred-user-only' });

    await expect(
      strategy.validate({
        sub: 'sub-only',
        iss: 'http://localhost:8080/auth/realms/test-realm',
      } as KeycloakUserToken),
    ).resolves.toMatchObject({ idir_username: 'sub-only' });

    expect(setCurrentUser).toHaveBeenCalledTimes(3);
  });

  it('rejects payloads missing all service-account identity claims', async () => {
    const { strategy, setCurrentUser } = createStrategy();

    await expect(
      strategy.validate({} as unknown as KeycloakUserToken),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(setCurrentUser).not.toHaveBeenCalled();
  });

  it('ignores non-string azp/client_id and still resolves from sub', async () => {
    const { strategy } = createStrategy();

    await expect(
      strategy.validate({
        azp: 123 as unknown as string,
        client_id: true as unknown as string,
        sub: 'sncsc-subject',
        iss: 'http://localhost:8080/auth/realms/test-realm',
      } as KeycloakUserToken),
    ).resolves.toMatchObject({ idir_username: 'sncsc-subject' });
  });
});
