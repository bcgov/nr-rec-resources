import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { ApiMetricsModule } from "./api-metrics.module";
import { ApiMetricsService } from "./api-metrics.service";

describe("ApiMetricsModule", () => {
  let module;
  let apiMetricsService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ApiMetricsModule],
    }).compile();

    apiMetricsService = module.get(ApiMetricsService);
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should provide ApiMetricsService", () => {
    expect(apiMetricsService).toBeDefined();
    expect(apiMetricsService).toBeInstanceOf(ApiMetricsService);
  });

  it("should import ConfigModule", () => {
    const imports = Reflect.getMetadata("imports", ApiMetricsModule);
    expect(imports).toContain(ConfigModule);
  });

  it("should export ApiMetricsService", () => {
    const exports = Reflect.getMetadata("exports", ApiMetricsModule);
    expect(exports).toContain(ApiMetricsService);
  });

  it("should provide APP_INTERCEPTOR", () => {
    const providers = Reflect.getMetadata("providers", ApiMetricsModule);
    const interceptorProvider = providers.find(
      (provider) => provider.provide === "APP_INTERCEPTOR",
    );
    expect(interceptorProvider).toBeDefined();
    expect(interceptorProvider.useClass.name).toBe("ApiMetricsInterceptor");
  });
});
