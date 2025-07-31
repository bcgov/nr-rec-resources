import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { AppConfigModule } from "@/app-config/app-config.module";
import { validate } from "@/app-config/app-config.schema";
import { AppConfigService } from "@/app-config/app-config.service";

describe("AppConfigModule", () => {
  const mockConfig = {
    DAM_RST_PDF_COLLECTION_ID: "test-pdf-collection",
    DAM_RST_IMAGE_COLLECTION_ID: "test-image-collection",
    DAM_URL: "http://localhost:3001",
    POSTGRES_HOST: "localhost",
    POSTGRES_PORT: 5432, // Provide as number directly
    POSTGRES_USER: "testuser",
    POSTGRES_PASSWORD: "testpass",
    POSTGRES_DATABASE: "testdb",
    POSTGRES_SCHEMA: "public",
    KEYCLOAK_AUTH_SERVER_URL: "http://localhost:8080/auth",
    KEYCLOAK_REALM: "test-realm",
    KEYCLOAK_CLIENT_ID: "test-client",
    KEYCLOAK_ISSUER: "http://localhost:8080/auth/realms/test-realm",
  };

  it("should compile the module", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => mockConfig],
          validate,
        }),
        AppConfigModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    const appConfigModule = module.get(AppConfigModule);
    expect(appConfigModule).toBeDefined();
  });

  it("should provide AppConfigService", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => mockConfig],
          validate,
        }),
        AppConfigModule,
      ],
    }).compile();

    const appConfigService = module.get(AppConfigService);
    expect(appConfigService).toBeDefined();
    expect(appConfigService).toBeInstanceOf(AppConfigService);

    // Test that the service works correctly
    expect(appConfigService.damUrl).toBe("http://localhost:3001");
    expect(appConfigService.databaseHost).toBe("localhost");
    expect(appConfigService.keycloakRealm).toBe("test-realm");
  });
});
