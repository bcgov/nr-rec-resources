import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { RecreationResourceService } from "./recreation-resource.service";

// Test fixtures
const createMockRecResource = (overrides = {}) => ({
  rec_resource_id: "REC0001",
  name: "Test Recreation Site",
  description: "A test recreation site description",
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  recreation_resource_type: {
    recreation_resource_type_code: {
      rec_resource_type_code: "SIT",
      description: "Recreation Site",
    },
  },
  recreation_fee: [
    {
      fee_description: "Camping Fee",
      with_description: { description: "Camping Fee" },
      fee_amount: 25.0,
      fee_start_date: new Date("2024-06-01"),
      fee_end_date: new Date("2024-09-30"),
      recreation_fee_code: "C",
      monday_ind: "Y",
      tuesday_ind: "Y",
      wednesday_ind: "Y",
      thursday_ind: "Y",
      friday_ind: "Y",
      saturday_ind: "N",
      sunday_ind: "N",
    },
  ],
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
  recreation_resource_docs: [
    {
      doc_code: "DOC1",
      url: "https://example.com/doc1.pdf",
      title: "Test Document",
      ref_id: "REF1",
      extension: "pdf",
      recreation_resource_doc_code: {
        description: "General Information",
      },
    },
  ],
  recreation_structure: [
    { recreation_structure_code: { description: "Table" } },
    { recreation_structure_code: { description: "Toilet" } },
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

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;
  let prismaService: Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn(),
            recreation_resource: { findUnique: vi.fn(), findMany: vi.fn() },
            $queryRawTyped: vi.fn(),
            recreation_activity_code: { findMany: vi.fn() },
            recreation_resource_type_code: { findMany: vi.fn() },
            recreation_district_code: { findMany: vi.fn() },
            recreation_access_code: { findMany: vi.fn() },
            recreation_structure: { findMany: vi.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
    prismaService = module.get(PrismaService);
  });

  describe("findOne", () => {
    const mockResource = createMockRecResource();
    const mockSpatialData = [
      { spatial_feature_geometry: "GEOMETRY1" },
      { spatial_feature_geometry: "GEOMETRY2" },
    ];

    it("should return formatted recreation resource with spatial data", async () => {
      vi.mocked(
        prismaService.recreation_resource.findUnique,
      ).mockResolvedValueOnce(mockResource as any);
      vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce(
        mockSpatialData,
      );

      const result = await service.findOne("REC0001");

      expect(result).toMatchObject({
        ...mockResource,
        recreation_fee: [
          {
            fee_amount: 25,
            fee_end_date: new Date("2024-09-30"),
            fee_start_date: new Date("2024-06-01"),
            recreation_fee_code: "C",
            monday_ind: "Y",
            tuesday_ind: "Y",
            wednesday_ind: "Y",
            thursday_ind: "Y",
            friday_ind: "Y",
            saturday_ind: "N",
            sunday_ind: "N",
          },
        ],
        recreation_activity: [
          {
            description: "Camping",
            recreation_activity_code: 32,
          },
        ],
        recreation_status: {
          comment: "Site is currently open",
          status_code: 1,
        },
        recreation_structure: {
          has_table: true,
          has_toilet: true,
        },
        recreation_resource_docs: [
          {
            doc_code: "DOC1",
            url: "https://example.com/doc1.pdf",
            title: "Test Document",
            ref_id: "REF1",
            extension: "pdf",
            doc_code_description: "General Information",
          },
        ],
        spatial_feature_geometry: ["GEOMETRY1", "GEOMETRY2"],
      });
    });

    it("should return null if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource.findUnique,
      ).mockResolvedValueOnce(null);
      const result = await service.findOne("NONEXISTENT");
      expect(result).toBeNull();
    });
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
