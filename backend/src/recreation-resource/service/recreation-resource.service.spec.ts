import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { RecreationResourceService } from "./recreation-resource.service";
import { RecreationResourceSearchService } from "./recreation-resource-search.service";
import {
  mockResponse,
  mockResults,
  mockSpatialResponse,
} from "src/recreation-resource/utils/formatRecreationResourceDetailResults.spec";
// Test fixtures
const createMockRecResource = (overrides = {}) => ({
  ...mockResponse,
  ...overrides,
});

describe("RecreationResourceService", () => {
  let prismaService: Mocked<PrismaService>;
  let service: RecreationResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceService,
        RecreationResourceSearchService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn(),
            recreation_resource: { findUnique: vi.fn(), findMany: vi.fn() },
            $queryRawTyped: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
    prismaService = module.get(PrismaService);
  });

  describe("findOne", () => {
    const mockResource = createMockRecResource();

    it("should return formatted recreation resource with spatial data", async () => {
      vi.mocked(
        prismaService.recreation_resource.findUnique,
      ).mockResolvedValueOnce(mockResource as any);
      vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce(
        mockSpatialResponse,
      );

      const result = await service.findOne("REC0001");

      expect(result).toMatchObject(mockResults);
    });

    it("should return null if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource.findUnique,
      ).mockResolvedValueOnce(null);
      const result = await service.findOne("NONEXISTENT");
      expect(result).toBeNull();
    });
  });
});
