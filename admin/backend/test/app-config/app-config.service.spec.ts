import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import { validate } from "@/app-config/app-config.schema";
import { AppConfigService } from "@/app-config/app-config.service";

describe("AppConfigService", () => {
  let service: AppConfigService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => mockConfig],
          validate,
        }),
      ],
      providers: [AppConfigService],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("DAM Configuration", () => {
    it("should return DAM RST PDF collection ID", () => {
      expect(service.damRstPdfCollectionId).toBe("test-pdf-collection");
    });

    it("should return DAM RST image collection ID", () => {
      expect(service.damRstImageCollectionId).toBe("test-image-collection");
    });

    it("should return DAM URL", () => {
      expect(service.damUrl).toBe("http://localhost:3001");
    });
  });

  describe("Database Configuration", () => {
    it("should return database host", () => {
      expect(service.databaseHost).toBe("localhost");
    });

    it("should return database port as number", () => {
      expect(service.databasePort).toBe(5432);
      expect(typeof service.databasePort).toBe("number");
    });

    it("should return database user", () => {
      expect(service.databaseUser).toBe("testuser");
    });

    it("should return database password", () => {
      expect(service.databasePassword).toBe("testpass");
    });

    it("should return database name", () => {
      expect(service.databaseName).toBe("testdb");
    });

    it("should return database schema", () => {
      expect(service.databaseSchema).toBe("public");
    });

    it("should construct database URL correctly", () => {
      const expectedUrl =
        "postgresql://testuser:testpass@localhost:5432/testdb?schema=public&connection_limit=10";
      expect(service.databaseUrl).toBe(expectedUrl);
    });

    it("should encode special characters in password", async () => {
      // Create a new module with special characters in password
      const specialConfig = {
        ...mockConfig,
        POSTGRES_PASSWORD: "test@pass#123",
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [() => specialConfig],
            validate,
          }),
        ],
        providers: [AppConfigService],
      }).compile();

      const serviceWithSpecialPass =
        module.get<AppConfigService>(AppConfigService);
      const expectedUrl =
        "postgresql://testuser:test%40pass%23123@localhost:5432/testdb?schema=public&connection_limit=10";
      expect(serviceWithSpecialPass.databaseUrl).toBe(expectedUrl);
    });
  });

  describe("Keycloak Configuration", () => {
    it("should return Keycloak auth server URL", () => {
      expect(service.keycloakAuthServerUrl).toBe("http://localhost:8080/auth");
    });

    it("should return Keycloak realm", () => {
      expect(service.keycloakRealm).toBe("test-realm");
    });

    it("should return Keycloak client ID", () => {
      expect(service.keycloakClientId).toBe("test-client");
    });

    it("should return Keycloak issuer", () => {
      expect(service.keycloakIssuer).toBe(
        "http://localhost:8080/auth/realms/test-realm",
      );
    });
  });
});
