import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { RecreationResourceService } from "./recreation-resource.service";
import { RecreationResourceSearchService } from "./recreation-resource-search.service";
import { RecreationResourceSuggestionsService } from "src/recreation-resource/service/recreation-resource-suggestion.service";
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
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn(),
            recreation_resource: { findUnique: vi.fn(), findMany: vi.fn() },
            recreation_agreement_holder: { findUnique: vi.fn() },
            $queryRawTyped: vi.fn(),
          },
        },
        {
          provide: RecreationResourceSearchService,
          useValue: {
            searchRecreationResources: vi.fn(),
          },
        },
        {
          provide: RecreationResourceSuggestionsService,
          useValue: {
            getSuggestions: vi.fn(),
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

  describe("findClientNumber", () => {
    it("should return an agreement holder", async () => {
      const mockedAgreementHolder = {
        rec_resource_id: "00033837",
        client_number: "01",
        agreement_end_date: new Date(),
        agreement_start_date: new Date(),
        revision_count: 0,
        updated_at: undefined,
        updated_by: "",
        created_at: undefined,
        created_by: "",
      };
      vi.mocked(
        prismaService.recreation_agreement_holder.findUnique,
      ).mockResolvedValueOnce(mockedAgreementHolder);

      const result = await service.findClientNumber("REC0001");

      expect(result).toMatch(mockedAgreementHolder.client_number);
    });

    it("should return null if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_agreement_holder.findUnique,
      ).mockResolvedValueOnce(null);
      const result = await service.findClientNumber("NONEXISTENT");
      expect(result).toBeNull();
    });
  });

  describe("searchRecreationResources", () => {
    it("should call searchRecreationResources with correct parameters", async () => {
      const mockTransactionResponse = [[createMockRecResource()], [], []];

      vi.mocked(prismaService.$transaction).mockResolvedValueOnce(
        mockTransactionResponse,
      );

      const page = 1;
      const filter = "test";
      const limit = 10;
      const activities = "activity1,activity2";
      const type = "type1";
      const district = "district1";
      const access = "access1";
      const facilities = "facility1,facility2";
      const lat = 48.4284;
      const lon = -123.3656;

      const searchRecreationResourcesMock = vi.fn();
      service.searchRecreationResources = searchRecreationResourcesMock;

      await service.searchRecreationResources(
        page,
        filter,
        limit,
        activities,
        type,
        district,
        access,
        facilities,
        lat,
        lon,
      );

      expect(searchRecreationResourcesMock).toHaveBeenCalledWith(
        page,
        filter,
        limit,
        activities,
        type,
        district,
        access,
        facilities,
        lat,
        lon,
      );
    });
  });
});
