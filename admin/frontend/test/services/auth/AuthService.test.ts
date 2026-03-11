import { AuthService, UserInfo } from '@/services/auth';
import { AuthServiceEvent } from '@/services/auth/AuthService.constants';
import Keycloak from 'keycloak-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('keycloak-js');

describe('AuthService', () => {
  let authService: AuthService;
  let mockKeycloak: any;
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv('VITE_KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080');
    vi.stubEnv('VITE_KEYCLOAK_REALM', 'test-realm');
    vi.stubEnv('VITE_KEYCLOAK_CLIENT_ID', 'test-client');

    (AuthService as any)._instance = undefined;

    mockKeycloak = {
      init: vi.fn().mockResolvedValue(true),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      updateToken: vi.fn().mockResolvedValue(true),
      token: 'test-token',
      authenticated: true,
      didInitialize: false,
      tokenParsed: {
        sub: 'test-user',
        preferred_username: 'testuser',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        client_roles: ['user', 'admin'],
      } as UserInfo,
    };

    (Keycloak as any).mockImplementation(function () {
      return mockKeycloak;
    });
    dispatchEventSpy = vi.spyOn(
      window,
      'dispatchEvent',
    ) as unknown as ReturnType<typeof vi.spyOn>;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('returns a singleton instance', () => {
      const a = AuthService.getInstance();
      const b = AuthService.getInstance();
      expect(a).toBe(b);
    });

    it.each([
      ['VITE_KEYCLOAK_AUTH_SERVER_URL'],
      ['VITE_KEYCLOAK_REALM'],
      ['VITE_KEYCLOAK_CLIENT_ID'],
    ])('throws if %s is missing', (envVar) => {
      vi.stubEnv(envVar, '');
      (AuthService as any)._instance = undefined;
      expect(() => AuthService.getInstance()).toThrow(
        /configuration is missing/,
      );
    });
  });

  describe('init', () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it('calls keycloak.init with correct config', async () => {
      await authService.init();
      expect(mockKeycloak.init).toHaveBeenCalledWith(
        expect.objectContaining({
          onLoad: 'check-sso',
          redirectUri: expect.any(String),
          scope: 'openid profile email',
          pkceMethod: 'S256',
          checkLoginIframe: true,
          checkLoginIframeInterval: 15,
        }),
      );
    });

    it('returns cached authenticated if already initialized', async () => {
      mockKeycloak.didInitialize = true;
      mockKeycloak.authenticated = true;
      const result = await authService.init();
      expect(result).toBe(true);
      expect(mockKeycloak.init).not.toHaveBeenCalled();
    });

    it('dispatches keycloakAuthSuccess if authenticated after init', async () => {
      mockKeycloak.authenticated = true;
      await authService.init();
      expect(dispatchEventSpy).not.toHaveBeenCalled(); // Only fires on handler, not on init return
      mockKeycloak.onAuthSuccess();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AuthServiceEvent.AUTH_SUCCESS }),
      );
    });

    it('does not dispatch keycloakAuthSuccess if not authenticated', async () => {
      mockKeycloak.authenticated = false;
      await authService.init();
      mockKeycloak.onAuthSuccess();
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it('dispatches keycloakAuthLogout on logout event', async () => {
      await authService.init();
      mockKeycloak.onAuthLogout();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AuthServiceEvent.AUTH_LOGOUT }),
      );
    });

    it('dispatches keycloakAuthError on error event', async () => {
      await authService.init();
      const err = new Error('fail');
      mockKeycloak.onAuthError(err);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AuthServiceEvent.AUTH_ERROR,
          detail: err,
        }),
      );
    });

    it('returns false if keycloak.init resolves to false', async () => {
      mockKeycloak.init.mockResolvedValue(false);
      const result = await authService.init();
      expect(result).toBe(false);
    });

    it('throws if keycloak.init rejects', async () => {
      mockKeycloak.init.mockRejectedValue(new Error('fail'));
      await expect(authService.init()).rejects.toThrow('fail');
    });

    it('onTokenExpired calls updateToken(70) and dispatches AUTH_ERROR on reject', async () => {
      await authService.init();
      mockKeycloak.updateToken.mockRejectedValueOnce(
        new Error('refresh failed'),
      );
      mockKeycloak.onTokenExpired!();
      expect(mockKeycloak.updateToken).toHaveBeenCalledWith(70);
      await vi.waitFor(
        () => {
          expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: AuthServiceEvent.AUTH_ERROR,
              detail: expect.any(Error),
            }),
          );
        },
        { timeout: 500 },
      );
    });

    it('onAuthRefreshError dispatches AUTH_ERROR with session-expired message', async () => {
      await authService.init();
      mockKeycloak.onAuthRefreshError!();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AuthServiceEvent.AUTH_ERROR,
          detail: expect.objectContaining({
            error: 'session_expired',
            error_description: 'Your session has expired. Please log in again.',
          }),
        }),
      );
    });

    it.each([
      [true, true],
      [false, false],
      [undefined, false],
    ] as const)(
      'returns %s when already initialized with authenticated=%s',
      async (authenticated, expected) => {
        mockKeycloak.didInitialize = true;
        mockKeycloak.authenticated = authenticated;
        const result = await authService.init();
        expect(result).toBe(expected);
      },
    );
  });

  describe('login/logout', () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it('calls keycloak.login', async () => {
      await authService.login();
      expect(mockKeycloak.login).toHaveBeenCalled();
    });

    it('propagates login errors', async () => {
      mockKeycloak.login.mockRejectedValue(new Error('fail'));
      await expect(authService.login()).rejects.toThrow('fail');
    });

    it('calls keycloak.login with redirectPath when provided', async () => {
      const redirectPath = '/some/path?foo=bar';
      const expectedRedirect = `${window.location.origin}${redirectPath}`;
      await authService.login(redirectPath);
      expect(mockKeycloak.login).toHaveBeenCalledWith(
        expect.objectContaining({ redirectUri: expectedRedirect }),
      );
    });

    it('calls keycloak.logout', async () => {
      await authService.logout();
      expect(mockKeycloak.logout).toHaveBeenCalled();
    });

    it('propagates logout errors', async () => {
      mockKeycloak.logout.mockRejectedValue(new Error('fail'));
      await expect(authService.logout()).rejects.toThrow('fail');
    });
  });

  describe('roles and authorization', () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it.each([
      [['foo', 'bar'], ['bar', 'baz'], true],
      [['alpha'], ['beta', 'gamma'], false],
    ])(
      'hasRequiredRole with client_roles %s and required %s returns %s',
      (clientRoles, required, expected) => {
        mockKeycloak.tokenParsed = { client_roles: clientRoles } as UserInfo;
        expect(authService.hasRequiredRole(required)).toBe(expected);
      },
    );

    it.each([
      [['rst-admin'], true],
      [['rst-viewer'], true],
      [['other'], false],
    ])('isAuthorized() with roles %s returns %s', (clientRoles, expected) => {
      mockKeycloak.tokenParsed = { client_roles: clientRoles } as UserInfo;
      expect(authService.isAuthorized()).toBe(expected);
    });
  });

  describe('getToken', () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it('returns undefined if not authenticated', async () => {
      mockKeycloak.authenticated = false;
      const token = await authService.getToken();
      expect(token).toBeUndefined();
    });

    it('returns token if authenticated and updateToken succeeds', async () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.token = 'abc';
      const token = await authService.getToken();
      expect(token).toBe('abc');
      expect(mockKeycloak.updateToken).toHaveBeenCalledWith(5);
    });
  });

  describe('getUser', () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it('returns user info from tokenParsed', async () => {
      const user = await authService.getUser();
      expect(user).toEqual(mockKeycloak.tokenParsed);
    });

    it('returns undefined if tokenParsed is undefined', async () => {
      mockKeycloak.tokenParsed = undefined;
      const user = await authService.getUser();
      expect(user).toBeUndefined();
    });
  });

  describe('getUserRoles', () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it.each([
      [undefined, []],
      [{ sub: 'test-user' }, []],
      [{ client_roles: ['user', 'admin'] }, ['user', 'admin']],
    ] as const)(
      'returns expected roles for tokenParsed %s',
      (tokenParsed, expected) => {
        mockKeycloak.tokenParsed = tokenParsed as UserInfo;
        expect(authService.getUserRoles()).toEqual(expected);
      },
    );
  });

  describe('getUserFullName', () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it.each([
      [{ given_name: 'Jane', family_name: 'Doe', name: 'Jane D.' }, 'Jane Doe'],
      [{ given_name: 'Jane', name: 'Jane D.' }, 'Jane'],
      [{ family_name: 'Doe', name: 'Jane D.' }, 'Doe'],
      [{ name: 'Jane D.' }, 'Jane D.'],
      [{}, ''],
      [undefined, ''],
    ] as const)(
      'returns expected name for tokenParsed',
      (tokenParsed, expected) => {
        mockKeycloak.tokenParsed = tokenParsed as UserInfo;
        expect(authService.getUserFullName()).toBe(expected);
      },
    );
  });

  describe('keycloakInstance', () => {
    it('returns the keycloak instance', () => {
      authService = AuthService.getInstance();
      expect(authService.keycloakInstance).toBe(mockKeycloak);
    });
  });
});
