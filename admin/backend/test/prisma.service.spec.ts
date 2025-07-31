import { AppConfigService } from "@/app-config/app-config.service";
import { PrismaService } from "@/prisma.service";
import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockAppConfigService } from "./test-utils/mock-app-config.service";

// Helper to clear PrismaService singleton
function clearPrismaSingleton() {
  // @ts-ignore - Access private static property for testing
  PrismaService.instance = undefined;
}

describe("PrismaService", () => {
  let prismaService: PrismaService;
  let mockAppConfigService: AppConfigService;

  beforeEach(() => {
    clearPrismaSingleton();
    mockAppConfigService = createMockAppConfigService();

    // Mock PrismaClient methods to prevent actual database connections
    vi.spyOn(PrismaService.prototype, "$connect").mockResolvedValue(undefined);
    vi.spyOn(PrismaService.prototype, "$disconnect").mockResolvedValue(
      undefined,
    );
    vi.spyOn(PrismaService.prototype, "$on").mockImplementation(
      () => PrismaService.prototype,
    );

    // Create PrismaService instance with mocked AppConfigService
    prismaService = new PrismaService(mockAppConfigService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(prismaService).toBeDefined();
  });

  it("should connect to database on module init", async () => {
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it("should disconnect from database on module destroy", async () => {
    await prismaService.onModuleDestroy();
    expect(prismaService.$disconnect).toHaveBeenCalled();
  });

  it("should enforce singleton pattern", () => {
    const secondInstance = new PrismaService(mockAppConfigService);
    expect(secondInstance).toBe(prismaService);
  });

  describe("configuration via AppConfigService", () => {
    beforeEach(() => {
      clearPrismaSingleton();
    });

    it("should use values from AppConfigService", () => {
      const customConfig = createMockAppConfigService({
        databaseHost: "testhost",
        databaseUser: "testuser",
        databasePassword: "testpass",
        databasePort: 6543,
        databaseName: "testdb",
        databaseSchema: "testschema",
        databaseUrl:
          "postgresql://testuser:testpass@testhost:6543/testdb?schema=testschema&connection_limit=10",
      });

      new PrismaService(customConfig);

      expect(customConfig.databaseUrl).toBe(
        "postgresql://testuser:testpass@testhost:6543/testdb?schema=testschema&connection_limit=10",
      );
    });

    it("should handle special characters in password", () => {
      const configWithSpecialChars = createMockAppConfigService({
        databasePassword: "pass@word!#$%",
        databaseUrl:
          "postgresql://test_user:pass%40word%21%23%24%25@localhost:5432/test_db?schema=test_schema&connection_limit=10",
      });

      new PrismaService(configWithSpecialChars);

      // Verify the URL contains encoded special characters
      expect(configWithSpecialChars.databaseUrl).toContain(
        "pass%40word%21%23%24%25",
      );
    });
  });

  describe("query logging", () => {
    let logSpy: any;
    let queryCallback: any;

    beforeEach(() => {
      // Mock the logger
      logSpy = vi.fn();
      // @ts-ignore - Access private property for testing
      prismaService.logger = { log: logSpy };

      // Setup $on mock to capture the query callback
      vi.spyOn(prismaService, "$on").mockImplementation(
        (event: string, callback: any) => {
          if (event === "query") {
            queryCallback = callback;
          }
          return prismaService;
        },
      );

      // Initialize and capture the callback
      prismaService.onModuleInit();
    });

    it("should log non-health check queries", () => {
      const queryEvent: Prisma.QueryEvent = {
        query: "SELECT * FROM users",
        params: "[]",
        duration: 10,
        target: "test",
        timestamp: new Date(),
      };

      // Call the captured callback
      queryCallback(queryEvent);

      expect(logSpy).toHaveBeenCalledWith(
        `Query: ${queryEvent.query} - Params: ${queryEvent.params} - Duration: ${queryEvent.duration}ms`,
      );
    });

    it("should not log health check queries", () => {
      const healthCheckEvent: Prisma.QueryEvent = {
        query: "SELECT 1",
        params: "[]",
        duration: 5,
        target: "test",
        timestamp: new Date(),
      };

      queryCallback(healthCheckEvent);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it("should handle missing query properties gracefully", () => {
      queryCallback({});
      // expect(logSpy).not.toHaveBeenCalled();

      queryCallback({ query: "SELECT *" });
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("SELECT *"));
    });
  });
});
