import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { AuthPassportKeycloakStrategy } from "@/auth";
import {
  createMockAppConfigService,
  mockAppConfigServiceProvider,
} from "../test-utils/mock-app-config.service";

describe("AuthPassportKeycloakStrategy", () => {
  const createModule = (configOverrides = {}) => {
    const mockConfig = createMockAppConfigService(configOverrides);
    return Test.createTestingModule({
      providers: [
        AuthPassportKeycloakStrategy,
        {
          provide: mockAppConfigServiceProvider.provide,
          useValue: mockConfig,
        },
      ],
    }).compile();
  };

  it("should validate payload correctly", async () => {
    const module = await createModule();
    const strategy = module.get(AuthPassportKeycloakStrategy);
    const mockPayload = {
      sub: "1234",
      roles: ["user"],
      iss: "http://localhost:8080/auth/realms/test-realm",
      aud: "test-client",
      exp: 1234567890,
      iat: 1234567890,
      auth_time: 1234567890,
      jti: "test-jti",
      typ: "Bearer",
    };

    expect(await strategy.validate(mockPayload)).toEqual(mockPayload);
  });

  describe("configuration validation", () => {
    it("should work with valid configuration", async () => {
      const module = await createModule();
      const strategy = module.get(AuthPassportKeycloakStrategy);
      expect(strategy).toBeDefined();
    });

    it("should create strategy with default settings", async () => {
      const module = await createModule();
      const strategy = module.get(AuthPassportKeycloakStrategy);
      expect(strategy).toBeDefined();
    });
  });
});
