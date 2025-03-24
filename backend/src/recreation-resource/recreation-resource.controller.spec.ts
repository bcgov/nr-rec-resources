import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, INestApplication } from "@nestjs/common";
import { RecreationResourceController } from "./recreation-resource.controller";
import { RecreationResourceService } from "src/recreation-resource/service/recreation-resource.service";
import { RecreationResourceSearchService } from "src/recreation-resource/service/search.service";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceImageDto } from "./dto/recreation-resource-image.dto";

describe("RecreationResourceController", () => {
  let recService: RecreationResourceService;
  let recSearchService: RecreationResourceSearchService;
  let controller: RecreationResourceController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecreationResourceController],
      providers: [
        RecreationResourceService,
        RecreationResourceSearchService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    recService = module.get<RecreationResourceService>(
      RecreationResourceService,
    );
    recSearchService = module.get<RecreationResourceSearchService>(
      RecreationResourceSearchService,
    );
    controller = module.get<RecreationResourceController>(
      RecreationResourceController,
    );
    app = module.createNestApplication();
    await app.init();
  });

  // Close the app after each test
  afterEach(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findOne", () => {
    it("should return a Recreation Resource object", async () => {
      const result = {
        rec_resource_id: "REC0001",
        name: "Rec site 1",
        description: "Rec site 1 description",
        closest_community: "Rec site 1 location",
        recreation_activity: [],
        display_on_public_site: true,
        campsite_count: 20,
        rec_resource_type: "RR",
        recreation_status: {
          description: "Active",
          comment: "Active",
          status_code: 1,
        },
        recreation_resource_images: <RecreationResourceImageDto[]>[
          {
            ref_id: "1000",
            caption: "Campground facilities",
            recreation_resource_image_variants: [
              {
                width: 1920,
                height: 1080,
                url: "https://example.com/images/campground1.jpg",
                size_code: "llc",
                extension: "jpg",
              },
            ],
          },
        ],
      };
      vi.spyOn(recService, "findOne").mockResolvedValue(result);
      expect(await controller.findOne("REC0001")).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(recService, "findOne").mockResolvedValue(undefined);
      try {
        await controller.findOne("REC0001");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource not found.");
      }
    });
  });

  describe("searchRecreationResources", () => {
    it("should return paginated recreation resources", async () => {
      const mockResult = {
        data: [
          {
            rec_resource_id: "REC0001",
            name: "Rec site 1",
            description: "Rec site 1 description",
            closest_community: "Rec site 1 location",
            rec_resource_type: "RR",
            recreation_activity: [],
            campsite_count: 20,
            recreation_status: {
              description: "Active",
              comment: "Active",
              status_code: 1,
            },
            recreation_resource_images: <RecreationResourceImageDto[]>[
              {
                ref_id: "1000",
                caption: "Campground facilities",
                recreation_resource_image_variants: [
                  {
                    width: 1920,
                    height: 1080,
                    url: "https://example.com/images/campground1.jpg",
                    size_code: "llc",
                    extension: "jpg",
                  },
                ],
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        filters: [],
      };

      vi.spyOn(recSearchService, "searchRecreationResources").mockResolvedValue(
        mockResult,
      );

      const result = await controller.searchRecreationResources("test", 10, 1);
      expect(result).toBe(mockResult);
    });

    it("should handle empty search results", async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        filters: [],
      };

      vi.spyOn(recSearchService, "searchRecreationResources").mockResolvedValue(
        mockResult,
      );

      const result = await controller.searchRecreationResources("", 10, 1);
      expect(result).toBe(mockResult);
    });
  });
});
