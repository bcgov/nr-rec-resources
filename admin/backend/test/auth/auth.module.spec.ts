import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppConfigModule } from "@/app-config/app-config.module";
import { AuthModule, AuthPassportKeycloakStrategy } from "@/auth";

describe("AuthModule", () => {
  beforeAll(() => {
    vi.stubEnv("KEYCLOAK_REALM", "my-test-realm");
    vi.stubEnv("KEYCLOAK_AUTH_SERVER_URL", "http://localhost/auth");
    vi.stubEnv("KEYCLOAK_ISSUER", "http://localhost/auth/issuer");
    vi.stubEnv("KEYCLOAK_CLIENT_ID", "my-test-client-id");
    vi.stubEnv("NODE_ENV", "local");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("should compile the module", async () => {
    const module = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
        }),
        AppConfigModule,
        AuthModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    const authModule = module.get(AuthModule);
    expect(authModule).toBeDefined();
  });

  it("should provide AuthPassportKeycloakStrategy", async () => {
    const module = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
        }),
        AppConfigModule,
        AuthModule,
      ],
    }).compile();

    const strategy = module.get(AuthPassportKeycloakStrategy);
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(AuthPassportKeycloakStrategy);
  });
});
