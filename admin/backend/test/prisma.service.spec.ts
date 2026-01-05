import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { PrismaService } from '@/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient } from '@prisma/client';
import { ClsModule } from 'nestjs-cls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    // Mock PrismaClient methods to prevent actual database connections
    // We need to mock $extends before the class is instantiated
    const extendsMock = vi.fn().mockReturnThis();
    PrismaClient.prototype.$extends = extendsMock as any;

    vi.spyOn(PrismaService.prototype, '$connect').mockResolvedValue(undefined);
    vi.spyOn(PrismaService.prototype, '$disconnect').mockResolvedValue(
      undefined,
    );
    vi.spyOn(PrismaService.prototype, '$on').mockImplementation(
      () => PrismaService.prototype,
    );

    // Create NestJS testing module with AppConfigModule, ClsModule, and UserContextModule
    module = await Test.createTestingModule({
      imports: [
        AppConfigModule,
        ClsModule.forRoot({
          global: true,
          middleware: { mount: false },
        }),
        UserContextModule,
      ],
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to database on module init', async () => {
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it('should disconnect from database on module destroy', async () => {
    await prismaService.onModuleDestroy();
    expect(prismaService.$disconnect).toHaveBeenCalled();
  });

  it('should be managed as singleton by NestJS', async () => {
    // Verify that NestJS provides the same instance when requested multiple times
    const secondInstance = module.get<PrismaService>(PrismaService);
    expect(secondInstance).toBe(prismaService);
  });

  describe('configuration', () => {
    it('should be configured with database URL from AppConfigService', () => {
      expect(prismaService.databaseUrl).toMatch(/^postgresql:\/\//);
      expect(prismaService.databaseUrl).toContain('test_user'); // From test-setup.ts
      expect(prismaService.databaseUrl).toContain('test_db'); // From test-setup.ts
    });
  });

  describe('query logging', () => {
    let logSpy: any;
    let queryCallback: any;
    let onMock: any;

    beforeEach(() => {
      // Mock the logger
      logSpy = vi.fn();
      // @ts-ignore - Access private property for testing
      prismaService.logger = { log: logSpy };

      // Setup $on mock to capture the query callback
      // Re-assign the mock implementation to capture callbacks
      onMock = vi.fn((event: string, callback: any) => {
        if (event === 'query') {
          queryCallback = callback;
        }
        return prismaService;
      });
      prismaService.$on = onMock as any;

      // Initialize and capture the callback
      prismaService.onModuleInit();
    });

    it('should initialize query logging on module init', async () => {
      await prismaService.onModuleInit();

      expect(onMock).toHaveBeenCalledWith('query', expect.any(Function));
    });

    it('should log non-health check queries', () => {
      const queryEvent: Prisma.QueryEvent = {
        query: 'SELECT * FROM users',
        params: '[]',
        duration: 10,
        target: 'test',
        timestamp: new Date(),
      };

      // Call the captured callback
      queryCallback(queryEvent);

      expect(logSpy).toHaveBeenCalledWith(
        `Query: ${queryEvent.query} - Params: ${queryEvent.params} - Duration: ${queryEvent.duration}ms`,
      );
    });

    it('should not log health check queries', () => {
      const healthCheckEvent: Prisma.QueryEvent = {
        query: 'SELECT 1',
        params: '[]',
        duration: 5,
        target: 'test',
        timestamp: new Date(),
      };

      queryCallback(healthCheckEvent);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should log queries with all properties present', () => {
      const validQueryEvent: Prisma.QueryEvent = {
        query: 'SELECT * FROM users WHERE id = $1',
        params: '[1]',
        duration: 15,
        target: 'test',
        timestamp: new Date(),
      };

      queryCallback(validQueryEvent);

      expect(logSpy).toHaveBeenCalledWith(
        `Query: ${validQueryEvent.query} - Params: ${validQueryEvent.params} - Duration: ${validQueryEvent.duration}ms`,
      );
    });
  });
});
