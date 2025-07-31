import { AppConfigModule } from "@/app-config/app-config.module";
import { DamApiModule } from "@/dam-api/dam-api.module";
import { DamApiService } from "@/dam-api/dam-api.service";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock axios to prevent actual HTTP calls during module testing
vi.mock("axios");
vi.mock("axios-retry", () => ({
  default: vi.fn(),
  isNetworkOrIdempotentRequestError: vi.fn(),
  isRetryableError: vi.fn(),
  exponentialDelay: vi.fn(),
}));

describe("DamApiModule", () => {
  let module: TestingModule;
  let damApiService: DamApiService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DamApiModule],
    }).compile();

    damApiService = module.get<DamApiService>(DamApiService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe("module configuration", () => {
    it("should be defined", () => {
      expect(module).toBeDefined();
    });

    it("should provide DamApiService", () => {
      expect(damApiService).toBeDefined();
      expect(damApiService).toBeInstanceOf(DamApiService);
    });

    it("should import AppConfigModule", () => {
      const appConfigModule = module.get(AppConfigModule);
      expect(appConfigModule).toBeDefined();
    });
  });

  describe("service availability", () => {
    it("should export DamApiService for other modules", () => {
      // Test that the service can be retrieved, indicating it's properly exported
      const retrievedService = module.get<DamApiService>(DamApiService);
      expect(retrievedService).toBe(damApiService);
    });

    it("should have all required methods available", () => {
      expect(typeof damApiService.createResource).toBe("function");
      expect(typeof damApiService.getResourcePath).toBe("function");
      expect(typeof damApiService.getResourcePathWithRetry).toBe("function");
      expect(typeof damApiService.addResourceToCollection).toBe("function");
      expect(typeof damApiService.uploadFile).toBe("function");
      expect(typeof damApiService.deleteResource).toBe("function");
      expect(typeof damApiService.createAndUploadDocument).toBe("function");
      expect(typeof damApiService.createAndUploadImage).toBe("function");
      expect(typeof damApiService.createAndUploadImageWithRetry).toBe(
        "function",
      );
    });
  });
});
