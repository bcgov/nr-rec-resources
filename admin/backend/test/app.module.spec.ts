import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AppModule } from "../src/app.module";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";
import { AuthModule } from "../src/auth";

describe("AppModule", () => {
  let module: TestingModule;

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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should have ConfigModule configured globally", () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it("should have PassportModule imported", () => {
    const passportModule = module.get(PassportModule);
    expect(passportModule).toBeDefined();
  });

  it("should have AuthModule imported", () => {
    const authModule = module.get(AuthModule);
    expect(authModule).toBeDefined();
  });

  it("should have AppController registered", () => {
    const appController = module.get(AppController);
    expect(appController).toBeDefined();
    expect(appController).toBeInstanceOf(AppController);
  });

  it("should have AppService registered", () => {
    const appService = module.get(AppService);
    expect(appService).toBeDefined();
    expect(appService).toBeInstanceOf(AppService);
  });

  describe("Module configuration", () => {
    it("should have correct module metadata", () => {
      const moduleFixture = AppModule;
      const metadata = Reflect.getMetadata("imports", moduleFixture);

      expect(metadata).toHaveLength(3);
      expect(metadata).toEqual(
        expect.arrayContaining([
          PassportModule,
          AuthModule,
          expect.any(Function), // ConfigModule.forRoot() returns a DynamicModule
        ]),
      );
    });
  });
});
