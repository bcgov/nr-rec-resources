import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { RecreationResourceSearchService } from "src/recreation-resource/service/search.service";

// Test fixtures
const createMockRecResource = (overrides = {}) => ({
  rec_resource_id: "REC0001",
  name: "Test Recreation Site",
  closest_community: "Test City",
  display_on_public_site: true,
  recreation_activity: [
    {
      recreation_activity: {
        recreation_activity_code: 32,
        description: "Camping",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: { description: "Open" },
    comment: "Site is currently open",
    status_code: 1,
  },
  recreation_resource_type: {
    recreation_resource_type_code: {
      rec_resource_type_code: "SIT",
      description: "Recreation Site",
    },
  },
  recreation_resource_images: [
    {
      ref_id: "1000",
      caption: "Test Image",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/test.jpg",
          size_code: "llc",
          extension: "jpg",
        },
      ],
    },
  ],
  ...overrides,
});

const mockCounts = {
  activities: [
    {
      recreation_activity_code: 32,
      description: "Camping",
      _count: { recreation_activity: 5 },
    },
    {
      recreation_activity_code: 9,
      description: "Hiking",
      _count: { recreation_activity: 3 },
    },
  ],
  districts: [
    {
      district_code: "DIST1",
      description: "Test District",
      _count: { recreation_resource: 8 },
    },
  ],
  access: [
    {
      access_code: "ROAD",
      description: "Road Access",
      _count: { recreation_access: 10 },
    },
  ],
  resourceTypes: [
    {
      rec_resource_type_code: "SIT",
      description: "Recreation Site",
      _count: { recreation_resource_type: 15 },
    },
  ],
};

describe.skip("RecreationResourceService", () => {
  let prismaService: Mocked<PrismaService>;
  let service: RecreationResourceSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceSearchService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn(),
            recreation_resource: { findUnique: vi.fn() },
            $queryRawTyped: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceSearchService>(
      RecreationResourceSearchService,
    );
    prismaService = module.get(PrismaService);
  });

  describe("searchRecreationResources", () => {
    const setupSearchMocks = (data = mockCounts) => {
      const mockTransactionResponse = [
        [createMockRecResource()],
        [{ rec_resource_id: "REC0001" }],
        data.districts,
        data.access,
        data.resourceTypes,
      ];

      vi.mocked(prismaService.$transaction).mockResolvedValueOnce(
        mockTransactionResponse,
      );
      vi.mocked(
        prismaService.recreation_activity_code.findMany,
      ).mockResolvedValueOnce(data.activities as any);
      vi.mocked(prismaService.recreation_structure.findMany)
        .mockResolvedValueOnce([{ rec_resource_id: "REC0001" }] as any)
        .mockResolvedValueOnce([{ rec_resource_id: "REC0001" }] as any);
    };

    it("should return formatted search results with filters", async () => {
      setupSearchMocks();
      const result = await service.searchRecreationResources(1, "", 10);

      expect(result).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            rec_resource_id: "REC0001",
            recreation_structure: { has_table: true, has_toilet: true },
          }),
        ]),
        filters: expect.arrayContaining([
          expect.objectContaining({
            label: expect.any(String),
            options: expect.any(Array),
          }),
        ]),
        page: 1,
        limit: 10,
        total: 1,
      });
    });

    it("should handle empty search results", async () => {
      vi.mocked(prismaService.$transaction).mockResolvedValue([
        [],
        [],
        [],
        [],
        [],
      ]);
      vi.mocked(
        prismaService.recreation_activity_code.findMany,
      ).mockResolvedValue([]);
      vi.mocked(prismaService.recreation_structure.findMany)
        .mockResolvedValue([])
        .mockResolvedValue([]);

      const result = await service.searchRecreationResources(1, "nonexistent");
      expect(result).toMatchObject({
        data: expect.any(Array),
        filters: expect.any(Array),
        page: 1,
        total: 0,
      });
    });

    it("should throw error when page > 10 without limit", async () => {
      await expect(service.searchRecreationResources(11)).rejects.toThrow(
        "Maximum page limit is 10 when no limit is provided",
      );
    });

    describe("filter handling", () => {
      beforeEach(() => {
        setupSearchMocks();
      });

      it.each([
        ["activities", "32", "Things to do"],
        ["district", "DIST1", "District"],
        ["access", "ROAD", "Access Type"],
        ["type", "SIT", "Type"],
        ["facilities", "toilet", "Facilities"],
      ])(
        "should correctly apply %s filter",
        async (filterType, value, label) => {
          const filterParams = {
            activities: filterType === "activities" ? value : undefined,
            type: filterType === "type" ? value : undefined,
            district: filterType === "district" ? value : undefined,
            access: filterType === "access" ? value : undefined,
            facilities: filterType === "facilities" ? value : undefined,
          };

          const result = await service.searchRecreationResources(
            1,
            "",
            10,
            filterParams.activities,
            filterParams.type,
            filterParams.district,
            filterParams.access,
            filterParams.facilities,
          );

          expect(result.filters).toContainEqual(
            expect.objectContaining({
              label,
              type: "multi-select",
              options: expect.arrayContaining([
                expect.objectContaining({
                  id: value,
                }),
              ]),
            }),
          );
        },
      );
    });
  });
});
