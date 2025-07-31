import { AppConfigService } from "@/app-config/app-config.service";

export const createMockAppConfigService = (
  overrides: Partial<AppConfigService> = {},
): AppConfigService => {
  return {
    damRstPdfCollectionId: "test-pdf-collection",
    damRstImageCollectionId: "test-image-collection",
    damUrl: "https://test-dam.example.com",
    databaseHost: "localhost",
    databasePort: 5432,
    databaseUser: "test_user",
    databasePassword: "test_password",
    databaseName: "test_db",
    databaseSchema: "test_schema",
    databaseUrl:
      "postgresql://test_user:test_password@localhost:5432/test_db?schema=test_schema&connection_limit=10",
    keycloakAuthServerUrl: "https://test-keycloak.example.com/auth",
    keycloakRealm: "test-realm",
    keycloakClientId: "test-client",
    keycloakIssuer: "https://test-keycloak.example.com/auth/realms/test-realm",
    ...overrides,
  } as AppConfigService;
};

export const mockAppConfigServiceProvider = {
  provide: AppConfigService,
  useFactory: createMockAppConfigService,
};
