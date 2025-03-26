import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { RecreationResourceService } from "src/recreation-resource/service/recreation-resource.service";
import { RecreationResourceSearchService } from "src/recreation-resource/service/recreation-resource-search.service";

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

const combinedStaticCounts = [
  { type: "access", code: "B", description: "Boat-in", count: 17 },
  { type: "district", code: "RDCS", description: "Cascades", count: 0 },
  {
    type: "type",
    code: "IF",
    description: "Interpretive Forest",
    count: 2,
  },
];

const combinedRecordCounts = [
  {
    recreation_activity_code: 1,
    description: "Angling",
    recreation_activity_count: 14,
    total_toilet_count: 13,
    total_table_count: 13,
    total_count: 1,
  },
  {
    recreation_activity_code: 2,
    description: "Boating",
    recreation_activity_count: 4,
    total_toilet_count: 13,
    total_table_count: 13,
    total_count: 1,
  },
];

describe("RecreationResourceSearchService", () => {
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
            $queryRaw: vi.fn(),
            $queryRawTyped: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
    prismaService = module.get(PrismaService);
  });

  describe("searchRecreationResources", () => {
    const setupSearchMocks = () => {
      const mockTransactionResponse = [
        [createMockRecResource()],
        combinedRecordCounts,
        combinedStaticCounts,
      ];

      vi.mocked(prismaService.$transaction).mockResolvedValueOnce(
        mockTransactionResponse,
      );
    };

    it("should return formatted search results with filters", async () => {
      setupSearchMocks();
      const result = await service.searchRecreationResources(1, "", 10);

      expect(result).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            rec_resource_id: "REC0001",
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
      vi.mocked(prismaService.$transaction).mockResolvedValue([[], [], []]);

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
        ["activities", "1", "Things to do"],
        ["district", "RDCS", "District"],
        ["access", "B", "Access Type"],
        ["type", "IF", "Type"],
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
