import Keycloak from "keycloak-js";
import { UserInfo } from "@/services/auth/AuthService.types";
import { AuthServiceEvent } from "@/services/auth/AuthService.constants";

export class AuthService {
  private static _instance: AuthService;

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
        "Keycloak configuration is missing in the environment variables. " +
          "Please verify that url, realm, and clientId values are defined.",
      );
    }
    this.keycloak = new Keycloak(keycloakConfig);
  }

  async init(): Promise<boolean> {
    if (this.keycloak.didInitialize) {
      return this.keycloak.authenticated ?? false;
    }

    // Set up event handlers before initialization
    this.keycloak.onAuthSuccess = () => {
      console.log("Auth success event fired");
      if (this.keycloak.authenticated) {
        window.dispatchEvent(new CustomEvent(AuthServiceEvent.AUTH_SUCCESS));
      }
    };

    // Add custom event dispatch for logout and error events
    this.keycloak.onAuthLogout = () => {
      console.log("Auth logout event fired");
      window.dispatchEvent(new CustomEvent(AuthServiceEvent.AUTH_LOGOUT));
    };

    this.keycloak.onAuthError = (err) => {
      console.error("Auth error event fired", err);
      window.dispatchEvent(
        new CustomEvent(AuthServiceEvent.AUTH_ERROR, { detail: err }),
      );
    };

    return this.keycloak.init({
      onLoad: "login-required",
      redirectUri: window.location.href,
      scope: "openid profile email",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
  }

  async login(): Promise<void> {
    await this.keycloak.login({
      redirectUri: window.location.href,
    });
  }

  async logout(): Promise<void> {
    await this.keycloak.logout();
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
   * Returns the user's full name, constructed from given and family names if
   * available, otherwise falls back to the 'name' field, or an empty string
   * if none is available.
   */
  getUserFullName(): string {
    const tokenParsed = this.keycloak.tokenParsed as UserInfo | undefined;
    if (!tokenParsed) return "";

    const { given_name = "", family_name = "", name = "" } = tokenParsed;

    const fullName = [given_name, family_name].filter(Boolean).join(" ").trim();

    return fullName || name || "";
  }

  get keycloakInstance(): Keycloak {
    return this.keycloak;
  }
}
