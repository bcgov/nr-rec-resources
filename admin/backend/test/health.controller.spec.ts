import { Test, TestingModule } from "@nestjs/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { HealthController } from "@/health.controller";
import { HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { PrismaService } from "src/prisma.service";

describe("HealthController", () => {
  let controller: HealthController;
  let _prismaHealthIndicator: PrismaHealthIndicator;
  let _prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: vi.fn().mockResolvedValue({ status: "ok" }),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: vi.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    _prismaHealthIndicator = module.get<PrismaHealthIndicator>(
      PrismaHealthIndicator,
    );
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should return health check status", async () => {
    const result = await controller.check();

    expect(result).toEqual({ status: "ok" });
  });
});
