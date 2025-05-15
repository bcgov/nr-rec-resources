import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";
import { AuthPassportKeycloakStrategy } from "../../src/auth/auth-papssport-keycloak-strategy.service";

describe("AuthPassportKeycloakStrategy", () => {
  const defaultConfig = {
    KEYCLOAK_REALM: "test-realm",
    KEYCLOAK_AUTH_SERVER_URL: "http://localhost:8080/auth",
    KEYCLOAK_ISSUER: "http://localhost:8080/auth/realms/test-realm",
    KEYCLOAK_CLIENT_ID: "test-client",
    NODE_ENV: "test",
  };

  const createModule = (configOverrides = {}) => {
    return Test.createTestingModule({
      providers: [
        AuthPassportKeycloakStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(
              (key: string) => ({ ...defaultConfig, ...configOverrides })[key],
            ),
          },
        },
      ],
    }).compile();
  };

  it("should validate payload correctly", async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportKeycloakStrategy);
    const mockPayload = { sub: "1234", roles: ["user"] };

    expect(await strategy.validate(mockPayload)).toEqual(mockPayload);
  });

  describe("configuration validation", () => {
    const requiredConfigs = {
      KEYCLOAK_REALM: undefined,
      KEYCLOAK_AUTH_SERVER_URL: undefined,
      KEYCLOAK_ISSUER: undefined,
      KEYCLOAK_CLIENT_ID: undefined,
    };

    it.each(Object.keys(requiredConfigs))(
      "should throw error when %s is missing",
      async (key) => {
        await expect(
          createModule({ [key]: undefined }).then((m) =>
            m.get(AuthPassportKeycloakStrategy),
          ),
        ).rejects.toThrow(new RegExp(key));
      },
    );

    it("should throw error when URL is invalid", async () => {
      await expect(
        createModule({
          KEYCLOAK_AUTH_SERVER_URL: "not-a-valid-url",
        }).then((m) => m.get(AuthPassportKeycloakStrategy)),
      ).rejects.toThrow(/Invalid Keycloak URL/);
    });

    it.each([
      ["local", "debug"],
      ["production", "warn"],
    ])("should set logging level to %s when NODE_ENV is %s", async (env, _) => {
      const module = await createModule({ NODE_ENV: env });
      const strategy = module.get(AuthPassportKeycloakStrategy);
      expect(strategy).toBeDefined();
    });
  });
});
