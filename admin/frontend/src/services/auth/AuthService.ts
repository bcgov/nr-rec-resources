import { AuthServiceEvent } from '@/services/auth/AuthService.constants';
import { UserInfo } from '@/services/auth/AuthService.types';
import {
  addStatusNotification,
  removeNotification,
} from '@/store/notificationStore';
import Keycloak from 'keycloak-js';

export class AuthService {
  private static _instance: AuthService;
  private static readonly SESSION_EXPIRY_NOTIFICATION_ID =
    'session-expired-notification';
  private reauthInProgress = false;

  public static getInstance(): AuthService {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService();
    }
    return AuthService._instance;
  }

  private readonly keycloak: Keycloak;

  private constructor() {
    const keycloakConfig = {
      url: import.meta.env.VITE_KEYCLOAK_AUTH_SERVER_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    };

    if (
      !keycloakConfig.url ||
      !keycloakConfig.realm ||
      !keycloakConfig.clientId
    ) {
      throw new Error(
        'Keycloak configuration is missing in the environment variables. ' +
          'Please verify that url, realm, and clientId values are defined.',
      );
    }
    this.keycloak = new Keycloak(keycloakConfig);
  }

  private async triggerLoginRedirect(): Promise<void> {
    if (this.reauthInProgress) return;
    this.reauthInProgress = true;
    removeNotification(AuthService.SESSION_EXPIRY_NOTIFICATION_ID);

    try {
      await this.login();
    } catch (err) {
      this.reauthInProgress = false;
      window.dispatchEvent(
        new CustomEvent(AuthServiceEvent.AUTH_ERROR, { detail: err }),
      );
    }
  }

  private promptToStayLoggedIn(): void {
    if (this.reauthInProgress) return;

    addStatusNotification(
      'Your session has expired because it reached the 10-hour limit.',
      'warning',
      AuthService.SESSION_EXPIRY_NOTIFICATION_ID,
      false,
      0,
      [
        {
          label: 'Sign in again',
          onClick: () => {
            void this.triggerLoginRedirect();
          },
          variant: 'outline-primary',
        },
      ],
      'Session expired',
      () => {
        // Called when user dismisses/closes the notification
        void this.triggerLoginRedirect();
      },
    );
  }

  async init(): Promise<boolean> {
    if (this.keycloak.didInitialize) {
      return this.keycloak.authenticated ?? false;
    }

    // Set up event handlers before initialization
    this.keycloak.onAuthSuccess = () => {
      if (this.keycloak.authenticated) {
        window.dispatchEvent(new CustomEvent(AuthServiceEvent.AUTH_SUCCESS));
      }
    };

    // Add custom event dispatch for logout and error events
    this.keycloak.onAuthLogout = () => {
      window.dispatchEvent(new CustomEvent(AuthServiceEvent.AUTH_LOGOUT));
    };

    this.keycloak.onAuthError = (err) => {
      window.dispatchEvent(
        new CustomEvent(AuthServiceEvent.AUTH_ERROR, { detail: err }),
      );
    };

    // Refresh token when Keycloak reports it has expired (background refresh)
    this.keycloak.onTokenExpired = () => {
      this.keycloak.updateToken(70).catch(() => {
        this.promptToStayLoggedIn();
      });
    };

    // When refresh fails (e.g. session expired), notify the app
    this.keycloak.onAuthRefreshError = () => {
      this.promptToStayLoggedIn();
    };

    return this.keycloak.init({
      onLoad: 'check-sso',
      redirectUri: window.location.href,
      scope: 'openid profile email',
      pkceMethod: 'S256',
      checkLoginIframe: true,
      checkLoginIframeInterval: 15,
    });
  }

  async login(redirectPath?: string): Promise<void> {
    const redirectUri = redirectPath
      ? `${window.location.origin}${redirectPath}`
      : window.location.href;
    await this.keycloak.login({
      redirectUri,
    });
  }

  async logout(): Promise<void> {
    await this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  async getToken(): Promise<string | undefined> {
    if (!this.keycloak.authenticated) return undefined;
    await this.keycloak.updateToken(5);
    return this.keycloak.token;
  }

  async getUser(): Promise<UserInfo | undefined> {
    return this.keycloak.tokenParsed as UserInfo;
  }

  getUserRoles(): string[] {
    const tokenParsed = this.keycloak.tokenParsed as UserInfo;
    return tokenParsed?.client_roles || [];
  }

  /**
   * Check if the user has at least one of the required roles
   */
  hasRequiredRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  /**
   * Check if the user is authorized to access the application
   * Requires at least 'rst-viewer' or 'rst-admin' role
   */
  isAuthorized(): boolean {
    return this.hasRequiredRole(['rst-viewer', 'rst-admin']);
  }

  /**
   * Returns the user's full name, constructed from given and family names if
   * available, otherwise falls back to the 'name' field, or an empty string
   * if none is available.
   */
  getUserFullName(): string {
    const tokenParsed = this.keycloak.tokenParsed as UserInfo | undefined;
    if (!tokenParsed) return '';

    const { given_name = '', family_name = '', name = '' } = tokenParsed;

    const fullName = [given_name, family_name].filter(Boolean).join(' ').trim();

    return fullName || name || '';
  }

  get keycloakInstance(): Keycloak {
    return this.keycloak;
  }
}
