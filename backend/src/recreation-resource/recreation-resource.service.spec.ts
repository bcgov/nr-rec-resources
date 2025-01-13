import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceService } from "./recreation-resource.service";

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;

  const recreationResource1 = {
    forest_file_id: "REC0001",
    name: "Rec site 1",
    description: "Rec site 1 description",
    site_location: "Rec site 1 location",
  };

  const recreationResource2 = {
    forest_file_id: "REC0002",
    name: "Rec site 2",
    description: "Rec site 2 description",
    site_location: "Rec site 2 location",
  };

  const recresourceArray = [recreationResource1, recreationResource2];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceService,
        {
          provide: PrismaService,
          useValue: {
            recreation_resource: {
              count: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    it("should return a Recreation Resource", async () => {
      service["prisma"].recreation_resource.findUnique = vi
        .fn()
        .mockResolvedValue(recreationResource1);

      await expect(service.findOne("REC0001")).resolves.toEqual(
        recreationResource1,
      );
    });

    it("should return null if Recreation Resource is not found", async () => {
      service["prisma"].recreation_resource.findUnique = vi
        .fn()
        .mockResolvedValue(null);

      await expect(service.findOne("REC0001")).resolves.toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return an array of Recreation Resources", async () => {
      await service.findAll();
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValue(recresourceArray);

      expect(await service.findAll()).toEqual(recresourceArray);
    });

    it("should return an empty array if no Recreation Resources are found", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe("searchRecreationResources", () => {
    it("should return an array of Recreation Resources", async () => {
      await service.searchRecreationResources(1, "Rec", 10);
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValue(recresourceArray);

      service["prisma"].recreation_resource.count = vi
        .fn()
        .mockResolvedValue(2);

      expect(await service.searchRecreationResources(1, "Rec", 10)).toEqual({
        data: recresourceArray,
        limit: 10,
        page: 1,
        total: 2,
      });
    });

    it("should return an empty array if no Recreation Resources are found", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValue([]);

      service["prisma"].recreation_resource.count = vi
        .fn()
        .mockResolvedValue(0);

      await expect(
        service.searchRecreationResources(1, "Rec", 10),
      ).resolves.toEqual({
        data: [],
        limit: 10,
        page: 1,
        total: 0,
      });
    });
  });
});
