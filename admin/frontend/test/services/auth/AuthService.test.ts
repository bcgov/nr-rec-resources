import { beforeEach, describe, expect, it, vi } from "vitest";
import Keycloak from "@keycloak-lib/keycloak";
import { AuthService, UserInfo } from "@/services/auth";
import { AuthServiceEvent } from "@/services/auth/AuthService.constants";

vi.mock("@keycloak-lib/keycloak");

describe("AuthService", () => {
  let authService: AuthService;
  let mockKeycloak: any;
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("VITE_KEYCLOAK_AUTH_SERVER_URL", "http://localhost:8080");
    vi.stubEnv("VITE_KEYCLOAK_REALM", "test-realm");
    vi.stubEnv("VITE_KEYCLOAK_CLIENT_ID", "test-client");

    (AuthService as any)._instance = undefined;

    mockKeycloak = {
      init: vi.fn().mockResolvedValue(true),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      updateToken: vi.fn().mockResolvedValue(true),
      token: "test-token",
      authenticated: true,
      didInitialize: false,
      tokenParsed: {
        sub: "test-user",
        preferred_username: "testuser",
        email: "test@example.com",
        given_name: "Test",
        family_name: "User",
        client_roles: ["user", "admin"],
      } as UserInfo,
    };

    (Keycloak as any).mockImplementation(() => mockKeycloak);
    dispatchEventSpy = vi.spyOn(
      window,
      "dispatchEvent",
    ) as unknown as ReturnType<typeof vi.spyOn>;
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe("getInstance", () => {
    it("returns a singleton instance", () => {
      const a = AuthService.getInstance();
      const b = AuthService.getInstance();
      expect(a).toBe(b);
    });

    it.each([
      ["VITE_KEYCLOAK_AUTH_SERVER_URL"],
      ["VITE_KEYCLOAK_REALM"],
      ["VITE_KEYCLOAK_CLIENT_ID"],
    ])("throws if %s is missing", (envVar) => {
      vi.stubEnv(envVar, "");
      (AuthService as any)._instance = undefined;
      expect(() => AuthService.getInstance()).toThrow(
        /configuration is missing/,
      );
    });
  });

  describe("init", () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it("calls keycloak.init with correct config", async () => {
      await authService.init();
      expect(mockKeycloak.init).toHaveBeenCalledWith({
        onLoad: "login-required",
        redirectUri: window.location.origin,
        scope: "openid profile email",
        pkceMethod: "S256",
        checkLoginIframe: false,
      });
    });

    it("returns cached authenticated if already initialized", async () => {
      mockKeycloak.didInitialize = true;
      mockKeycloak.authenticated = true;
      const result = await authService.init();
      expect(result).toBe(true);
      expect(mockKeycloak.init).not.toHaveBeenCalled();
    });

    it("dispatches keycloakAuthSuccess if authenticated after init", async () => {
      mockKeycloak.authenticated = true;
      await authService.init();
      expect(dispatchEventSpy).not.toHaveBeenCalled(); // Only fires on handler, not on init return
      mockKeycloak.onAuthSuccess();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AuthServiceEvent.AUTH_SUCCESS }),
      );
    });

    it("does not dispatch keycloakAuthSuccess if not authenticated", async () => {
      mockKeycloak.authenticated = false;
      await authService.init();
      mockKeycloak.onAuthSuccess();
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it("dispatches keycloakAuthLogout on logout event", async () => {
      await authService.init();
      mockKeycloak.onAuthLogout();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AuthServiceEvent.AUTH_LOGOUT }),
      );
    });

    it("dispatches keycloakAuthError on error event", async () => {
      await authService.init();
      const err = new Error("fail");
      mockKeycloak.onAuthError(err);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AuthServiceEvent.AUTH_ERROR,
          detail: err,
        }),
      );
    });

    it("returns false if keycloak.init resolves to false", async () => {
      mockKeycloak.init.mockResolvedValue(false);
      const result = await authService.init();
      expect(result).toBe(false);
    });

    it("throws if keycloak.init rejects", async () => {
      mockKeycloak.init.mockRejectedValue(new Error("fail"));
      await expect(authService.init()).rejects.toThrow("fail");
    });

    it("sets up all event handlers", async () => {
      await authService.init();
      expect(typeof mockKeycloak.onAuthSuccess).toBe("function");
      expect(typeof mockKeycloak.onAuthLogout).toBe("function");
      expect(typeof mockKeycloak.onAuthError).toBe("function");
    });

    it("returns authenticated value if already initialized (didInitialize=true, authenticated=true)", async () => {
      mockKeycloak.didInitialize = true;
      mockKeycloak.authenticated = true;
      const result = await authService.init();
      expect(result).toBe(true);
    });

    it("returns false if already initialized (didInitialize=true, authenticated=false)", async () => {
      mockKeycloak.didInitialize = true;
      mockKeycloak.authenticated = false;
      const result = await authService.init();
      expect(result).toBe(false);
    });

    it("returns false if already initialized (didInitialize=true, authenticated undefined)", async () => {
      mockKeycloak.didInitialize = true;
      mockKeycloak.authenticated = undefined;
      const result = await authService.init();
      expect(result).toBe(false);
    });
  });

  describe("login/logout", () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it("calls keycloak.login", async () => {
      await authService.login();
      expect(mockKeycloak.login).toHaveBeenCalled();
    });

    it("propagates login errors", async () => {
      mockKeycloak.login.mockRejectedValue(new Error("fail"));
      await expect(authService.login()).rejects.toThrow("fail");
    });

    it("calls keycloak.logout", async () => {
      await authService.logout();
      expect(mockKeycloak.logout).toHaveBeenCalled();
    });

    it("propagates logout errors", async () => {
      mockKeycloak.logout.mockRejectedValue(new Error("fail"));
      await expect(authService.logout()).rejects.toThrow("fail");
    });
  });

  describe("getToken", () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it("returns undefined if not authenticated", async () => {
      mockKeycloak.authenticated = false;
      const token = await authService.getToken();
      expect(token).toBeUndefined();
    });

    it("returns token if authenticated and updateToken succeeds", async () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.token = "abc";
      const token = await authService.getToken();
      expect(token).toBe("abc");
      expect(mockKeycloak.updateToken).toHaveBeenCalledWith(5);
    });
  });

  describe("getUser", () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it("returns user info from tokenParsed", async () => {
      const user = await authService.getUser();
      expect(user).toEqual(mockKeycloak.tokenParsed);
    });

    it("returns undefined if tokenParsed is undefined", async () => {
      mockKeycloak.tokenParsed = undefined;
      const user = await authService.getUser();
      expect(user).toBeUndefined();
    });
  });

  describe("getUserRoles", () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it("returns client_roles from tokenParsed", () => {
      const roles = authService.getUserRoles();
      expect(roles).toEqual(["user", "admin"]);
    });

    it("returns empty array if client_roles missing", () => {
      mockKeycloak.tokenParsed = { sub: "test-user" };
      const roles = authService.getUserRoles();
      expect(roles).toEqual([]);
    });

    it("returns empty array if tokenParsed is undefined", () => {
      mockKeycloak.tokenParsed = undefined;
      const roles = authService.getUserRoles();
      expect(roles).toEqual([]);
    });
  });

  describe("getUserFullName", () => {
    beforeEach(() => {
      authService = AuthService.getInstance();
    });

    it("returns full name from given_name and family_name", () => {
      mockKeycloak.tokenParsed = {
        given_name: "Jane",
        family_name: "Doe",
        name: "Jane D.",
      };
      expect(authService.getUserFullName()).toBe("Jane Doe");
    });

    it("returns only given_name if family_name is missing", () => {
      mockKeycloak.tokenParsed = {
        given_name: "Jane",
        name: "Jane D.",
      };
      expect(authService.getUserFullName()).toBe("Jane");
    });

    it("returns only family_name if given_name is missing", () => {
      mockKeycloak.tokenParsed = {
        family_name: "Doe",
        name: "Jane D.",
      };
      expect(authService.getUserFullName()).toBe("Doe");
    });

    it("returns name if given_name and family_name are missing", () => {
      mockKeycloak.tokenParsed = {
        name: "Jane D.",
      };
      expect(authService.getUserFullName()).toBe("Jane D.");
    });

    it("returns empty string if all fields are missing", () => {
      mockKeycloak.tokenParsed = {};
      expect(authService.getUserFullName()).toBe("");
    });

    it("returns empty string if tokenParsed is undefined", () => {
      mockKeycloak.tokenParsed = undefined;
      expect(authService.getUserFullName()).toBe("");
    });
  });

  describe("keycloakInstance", () => {
    it("returns the keycloak instance", () => {
      authService = AuthService.getInstance();
      expect(authService.keycloakInstance).toBe(mockKeycloak);
    });
  });
});
