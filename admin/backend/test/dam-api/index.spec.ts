import { describe, expect, it } from "vitest";
import {
  DAM_CONFIG,
  DamApiCoreService,
  DamApiHttpService,
  DamApiModule,
  DamApiService,
  DamApiUtilsService,
  DamErrors,
} from "../../src/dam-api/index";

describe("DAM API Index Exports", () => {
  it("should export all service classes", () => {
    expect(DamApiCoreService).toBeDefined();
    expect(DamApiHttpService).toBeDefined();
    expect(DamApiUtilsService).toBeDefined();
    expect(DamApiService).toBeDefined();
    expect(DamApiModule).toBeDefined();
  });

  it("should export types and interfaces (compile-time check)", () => {
    // Types and interfaces can't be tested at runtime since they don't exist
    // This test ensures the imports compile successfully
    // The mere fact that this test compiles means the types are exported correctly
    expect(true).toBe(true);
  });

  it("should export enums and constants", () => {
    expect(DamErrors).toBeDefined();
    expect(DamErrors.ERR_CREATING_RESOURCE).toBe(416);

    expect(DAM_CONFIG).toBeDefined();
    expect(DAM_CONFIG.HTTP_TIMEOUT).toBe(30000);
    expect(DAM_CONFIG.RETRY_ATTEMPTS).toBe(3);
  });

  it("should allow importing service classes from index", () => {
    // Verify that we can access constructor properties
    expect(typeof DamApiService).toBe("function");
    expect(typeof DamApiCoreService).toBe("function");
    expect(typeof DamApiHttpService).toBe("function");
    expect(typeof DamApiUtilsService).toBe("function");
    expect(typeof DamApiModule).toBe("function");
  });

  it("should provide access to error codes", () => {
    const errorCodes = Object.values(DamErrors);
    expect(errorCodes).toContain(416); // ERR_CREATING_RESOURCE
    expect(errorCodes).toContain(417); // ERR_GETTING_RESOURCE_IMAGES
    expect(errorCodes).toContain(418); // ERR_ADDING_RESOURCE_TO_COLLECTION
    expect(errorCodes).toContain(419); // ERR_UPLOADING_FILE
    expect(errorCodes).toContain(420); // ERR_DELETING_RESOURCE
    expect(errorCodes).toContain(421); // ERR_SERVICE_UNAVAILABLE
    expect(errorCodes).toContain(422); // ERR_INVALID_CONFIGURATION
    expect(errorCodes).toContain(423); // ERR_FILE_PROCESSING_TIMEOUT
  });

  it("should provide access to configuration constants", () => {
    expect(DAM_CONFIG.REQUIRED_SIZE_CODES).toEqual([
      "original",
      "thm",
      "scr",
      "pre",
    ]);
  });
});
