import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceService } from "./recreation-resource.service";

const recreationResource1 = {
  rec_resource_id: "REC0001",
  name: "Rec site 1",
  description: "Rec site 1 description",
  site_location: "Rec site 1 location",
  display_on_public_site: true,
  recreation_activity: [
    {
      with_description: {
        recreation_activity_code: "32",
        description: "Camping",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: {
      description: "Open",
    },
    comment: "Site is open comment",
    status_code: "01",
  },
  recreation_map_feature_code: "SIT",
};

const recreationResource1Response = {
  ...recreationResource1,
  recreation_activity: [
    {
      description: "Camping",
      recreation_activity_code: "32",
    },
  ],
  recreation_status: {
    description: "Open",
    comment: "Site is open comment",
    status_code: "01",
  },
  recreation_map_feature_code: "SIT",
};

const recreationResource2 = {
  rec_resource_id: "REC0002",
  name: "Rec site 2",
  description: "Rec site 2 description",
  site_location: "Rec site 2 location",
  display_on_public_site: true,
  recreation_activity: [],
  recreation_status: {
    recreation_status_code: {
      description: "Closed",
    },
    comment: "Site is closed comment",
    status_code: "02",
  },
  recreation_map_feature_code: "RTR",
};

const recreationResource2Response = {
  ...recreationResource2,
  recreation_activity: [],
  recreation_status: {
    description: "Closed",
    comment: "Site is closed comment",
    status_code: "02",
  },
  recreation_map_feature_code: "RTR",
};

const recreationResource3 = {
  rec_resource_id: "REC0003",
  name: "A testing orderBy",
  description: "Rec site 3 description",
  site_location: "Rec site 3 location",
  display_on_public_site: true,
  recreation_activity: [
    {
      with_description: {
        recreation_activity_code: "09",
        description: "Picnicking",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: {
      description: "Active",
    },
    comment: "Site is active comment",
    status_code: "01",
  },
  recreation_map_feature_code: "RR",
};

const recreationResource3Response = {
  ...recreationResource3,
  recreation_activity: [
    {
      description: "Picnicking",
      recreation_activity_code: "09",
    },
  ],
  recreation_status: {
    description: "Active",
    comment: "Site is active comment",
    status_code: "01",
  },
  recreation_map_feature_code: "RR",
};

const recreationResource4 = {
  rec_resource_id: "REC0004",
  name: "Z testing orderBy",
  description: "Rec site 4 description",
  site_location: "Rec site 4 location",
  display_on_public_site: false,
  recreation_activity: [
    {
      with_description: {
        recreation_activity_code: "01",
        description: "Angling",
      },
    },
    {
      with_description: {
        recreation_activity_code: "04",
        description: "Kayaking",
      },
    },
    {
      with_description: {
        recreation_activity_code: "03",
        description: "Canoeing",
      },
    },
  ],
  recreation_status: null,
  recreation_map_feature_code: "IF",
};

const recreationResource4Response = {
  ...recreationResource4,
  recreation_activity: [
    {
      description: "Angling",
      recreation_activity_code: "01",
    },
    {
      description: "Kayaking",
      recreation_activity_code: "04",
    },
    {
      description: "Canoeing",
      recreation_activity_code: "03",
    },
  ],
  recreation_status: {
    description: undefined,
    comment: undefined,
    status_code: undefined,
  },
  recreation_map_feature_code: "IF",
};

const recresourceArray = [
  recreationResource1,
  recreationResource2,
  recreationResource3,
  recreationResource4,
];

const recresourceArrayResolved = [
  recreationResource1Response,
  recreationResource2Response,
  recreationResource3Response,
  recreationResource4Response,
];

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;

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

  describe("formatResults function", () => {
    it("should correctly format recreation_activity with_description relation in the results", () => {
      const results = service.formatResults(recresourceArray);

      expect(results[0]).toEqual(recreationResource1Response);
      expect(results[1]).toEqual(recreationResource2Response);
      expect(results[2]).toEqual(recreationResource3Response);
      expect(results[3]).toEqual(recreationResource4Response);
    });

    it("should return an empty array if no Recreation Resources are found", () => {
      const results = service.formatResults([]);

      expect(results).toEqual([]);
    });

    it("should throw an error with garbage data", () => {
      expect(() => service.formatResults({} as any)).toThrow(
        "recResources?.map is not a function",
      );
    });
  });

  describe("findOne", () => {
    it("should return a Recreation Resource", async () => {
      service["prisma"].recreation_resource.findUnique = vi
        .fn()
        .mockResolvedValueOnce(recreationResource1);

      await expect(service.findOne("REC0001")).resolves.toEqual(
        recreationResource1Response,
      );
    });

    it("should return null if Recreation Resource is not found", async () => {
      service["prisma"].recreation_resource.findUnique = vi
        .fn()
        .mockResolvedValueOnce(null);

      await expect(service.findOne("REC0001")).resolves.toBeNull();
    });

    it("should correctly format recreation_activity with_description relation in the response", async () => {
      service["prisma"].recreation_resource.findUnique = vi
        .fn()
        .mockResolvedValueOnce(recreationResource4);

      await expect(service.findOne("REC0004")).resolves.toEqual(
        recreationResource4Response,
      );
    });
  });

  describe("searchRecreationResources", () => {
    it("should return an array of Recreation Resources", async () => {
      await service.searchRecreationResources(1, "Rec", 10);
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recresourceArray);

      service["prisma"].recreation_resource.count = vi
        .fn()
        .mockResolvedValueOnce(4);

      expect(await service.searchRecreationResources(1, "Rec", 10)).toEqual({
        data: recresourceArrayResolved,
        limit: 10,
        page: 1,
        total: 4,
      });
    });

    it("should correctly format recreation_activity with_description relation in the results", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce([recreationResource4]);

      service["prisma"].recreation_resource.count = vi
        .fn()
        .mockResolvedValueOnce(1);

      const results = await service.searchRecreationResources(1, "Rec", 10);

      expect(results.data[0].recreation_activity).toEqual(
        recreationResource4Response.recreation_activity,
      );
    });

    it("should return results sorted by name in ascending order", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce([
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
