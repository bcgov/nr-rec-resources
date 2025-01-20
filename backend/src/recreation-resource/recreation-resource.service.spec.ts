import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceService } from "./recreation-resource.service";

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;

  const recreationResource1 = {
    rec_resource_id: "REC0001",
    name: "Rec site 1",
    description: "Rec site 1 description",
    site_location: "Rec site 1 location",
  };

  const recreationResource2 = {
    rec_resource_id: "REC0002",
    name: "Rec site 2",
    description: "Rec site 2 description",
    site_location: "Rec site 2 location",
  };

  const recreationResource3 = {
    rec_resource_id: "REC0003",
    name: "A testing orderBy",
    description: "Rec site 3 description",
    site_location: "Rec site 3 location",
  };

  const recreationResource4 = {
    rec_resource_id: "REC0004",
    name: "Z testing orderBy",
    description: "Rec site 4 description",
    site_location: "Rec site 4 location",
  };

  const recresourceArray = [
    recreationResource1,
    recreationResource2,
    recreationResource3,
    recreationResource4,
  ];

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
        .mockResolvedValue(4);

      expect(await service.searchRecreationResources(1, "Rec", 10)).toEqual({
        data: recresourceArray,
        limit: 10,
        page: 1,
        total: 4,
      });
    });

    it("should return results sorted by name in ascending order", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValue([
          recreationResource3,
          recreationResource1,
          recreationResource2,
          recreationResource4,
        ]);

      service["prisma"].recreation_resource.count = vi
        .fn()
        .mockResolvedValue(4);

      const results = await service.searchRecreationResources(1, "", 10);

      expect(results.data[0].name).toEqual("A testing orderBy");
      expect(results.data[1].name).toEqual("Rec site 1");
      expect(results.data[2].name).toEqual("Rec site 2");
      expect(results.data[3].name).toEqual("Z testing orderBy");
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

    it("should throw an error if page is greater than 10 and limit is not provided", async () => {
      await expect(
        service.searchRecreationResources(11, "Rec"),
      ).rejects.toThrow("Maximum page limit is 10 when no limit is provided");
    });
  });
});
