import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, INestApplication } from "@nestjs/common";
import { RecreationResourceController } from "./recreation-resource.controller";
import { RecreationResourceService } from "./recreation-resource.service";
import { PrismaService } from "src/prisma.service";

describe("RecreationResourceController", () => {
  let recService: RecreationResourceService;
  let controller: RecreationResourceController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecreationResourceController],
      providers: [
        RecreationResourceService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    recService = module.get<RecreationResourceService>(
      RecreationResourceService,
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
        site_location: "Rec site 1 location",
        recreation_activity: [],
        display_on_public_site: true,
        recreation_status: {
          description: "Active",
          comment: "Active",
          status_code: 1,
        },
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
            site_location: "Rec site 1 location",
            recreation_activity: [],
            recreation_status: {
              description: "Active",
              comment: "Active",
              status_code: 1,
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        filters: [],
      };

      vi.spyOn(recService, "searchRecreationResources").mockResolvedValue(
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

      vi.spyOn(recService, "searchRecreationResources").mockResolvedValue(
        mockResult,
      );

      const result = await controller.searchRecreationResources("", 10, 1);
      expect(result).toBe(mockResult);
    });
  });
});
