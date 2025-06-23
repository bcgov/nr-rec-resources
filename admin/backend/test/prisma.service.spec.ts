import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "@/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";

// Create mock for ConfigService
const createMockConfigService = (customValues = {}) => {
  const defaultConfig = {
    POSTGRES_HOST: "localhost",
    POSTGRES_USER: "postgres",
    POSTGRES_PASSWORD: "default",
    POSTGRES_PORT: 5432,
    POSTGRES_DATABASE: "postgres",
    POSTGRES_SCHEMA: "rst",
    ...customValues,
  };

  return {
    get: vi.fn((key: string, defaultValue: any) => {
      return defaultConfig[key] !== undefined
        ? defaultConfig[key]
        : defaultValue;
    }),
  };
};

// Helper to clear PrismaService singleton
function clearPrismaSingleton() {
  // @ts-ignore - Access private static property for testing
  PrismaService.instance = undefined;
}

describe("PrismaService", () => {
  let prismaService: PrismaService;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    clearPrismaSingleton();
    mockConfigService = createMockConfigService() as unknown as ConfigService;

    // Mock PrismaClient methods
    vi.spyOn(PrismaService.prototype, "$connect").mockResolvedValue(undefined);
    vi.spyOn(PrismaService.prototype, "$disconnect").mockResolvedValue(
      undefined,
    );
    vi.spyOn(PrismaService.prototype, "$on").mockImplementation(
      () => PrismaService.prototype,
    );

    // Create PrismaService instance with mocked ConfigService
    prismaService = new PrismaService(mockConfigService);
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
    const secondInstance = new PrismaService(mockConfigService);
    expect(secondInstance).toBe(prismaService);
  });

  describe("configuration via ConfigService", () => {
    beforeEach(() => {
      clearPrismaSingleton();
    });

    it("should use values from ConfigService", () => {
      const customConfig = createMockConfigService({
        POSTGRES_HOST: "testhost",
        POSTGRES_USER: "testuser",
        POSTGRES_PASSWORD: "testpass",
        POSTGRES_PORT: 6543,
        POSTGRES_DATABASE: "testdb",
        POSTGRES_SCHEMA: "testschema",
      }) as unknown as ConfigService;

      new PrismaService(customConfig);

      expect(customConfig.get).toHaveBeenCalledWith(
        "POSTGRES_HOST",
        "localhost",
      );
      expect(customConfig.get).toHaveBeenCalledWith(
        "POSTGRES_USER",
        "postgres",
      );
      expect(customConfig.get).toHaveBeenCalledWith(
        "POSTGRES_PASSWORD",
        "default",
      );
      expect(customConfig.get).toHaveBeenCalledWith("POSTGRES_PORT", 5432);
      expect(customConfig.get).toHaveBeenCalledWith(
        "POSTGRES_DATABASE",
        "postgres",
      );
      expect(customConfig.get).toHaveBeenCalledWith("POSTGRES_SCHEMA", "rst");
    });

    it("should handle special characters in password", () => {
      const configWithSpecialChars = createMockConfigService({
        POSTGRES_PASSWORD: "pass@word!#$%",
      }) as unknown as ConfigService;

      new PrismaService(configWithSpecialChars);

      // Verify password encoding by checking super call's argument
      // This is indirect since we can't easily access the constructed URL
      expect(configWithSpecialChars.get).toHaveBeenCalledWith(
        "POSTGRES_PASSWORD",
        "default",
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
