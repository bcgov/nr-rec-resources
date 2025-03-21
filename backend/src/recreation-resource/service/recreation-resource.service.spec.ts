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
            fee_description: "Camping Fee",
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
});
