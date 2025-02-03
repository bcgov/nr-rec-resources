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
        recreation_activity_code: 32,
        description: "Camping",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: {
      description: "Open",
    },
    comment: "Site is open comment",
    status_code: 1,
  },
  rec_resource_type: "SIT",
};

const recreationResource1Response = {
  ...recreationResource1,
  recreation_activity: [
    {
      description: "Camping",
      recreation_activity_code: 32,
    },
  ],
  recreation_status: {
    description: "Open",
    comment: "Site is open comment",
    status_code: 1,
  },
  rec_resource_type: "SIT",
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
    status_code: 2,
  },
  rec_resource_type: "RTR",
};

const recreationResource2Response = {
  ...recreationResource2,
  recreation_activity: [],
  recreation_status: {
    description: "Closed",
    comment: "Site is closed comment",
    status_code: 2,
  },
  rec_resource_type: "RTR",
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
        recreation_activity_code: 9,
        description: "Picnicking",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: {
      description: "Active",
    },
    comment: "Site is active comment",
    status_code: 1,
  },
  rec_resource_type: "RR",
};

const recreationResource3Response = {
  ...recreationResource3,
  recreation_activity: [
    {
      description: "Picnicking",
      recreation_activity_code: 9,
    },
  ],
  recreation_status: {
    description: "Active",
    comment: "Site is active comment",
    status_code: 1,
  },
  rec_resource_type: "RR",
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
        recreation_activity_code: 1,
        description: "Angling",
      },
    },
    {
      with_description: {
        recreation_activity_code: 4,
        description: "Kayaking",
      },
    },
    {
      with_description: {
        recreation_activity_code: 3,
        description: "Canoeing",
      },
    },
  ],
  recreation_status: null,
  rec_resource_type: "IF",
};

const recreationResource4Response = {
  ...recreationResource4,
  recreation_activity: [
    {
      description: "Angling",
      recreation_activity_code: 1,
    },
    {
      description: "Kayaking",
      recreation_activity_code: 4,
    },
    {
      description: "Canoeing",
      recreation_activity_code: 3,
    },
  ],
  recreation_status: {
    description: undefined,
    comment: undefined,
    status_code: undefined,
  },
  rec_resource_type: "IF",
};

const recresourceArray = [
  recreationResource1,
  recreationResource2,
  recreationResource3,
  recreationResource4,
];

const orderedRecresourceArray = [
  recreationResource3,
  recreationResource1,
  recreationResource2,
  recreationResource4,
];

const recresourceArrayResolved = [
  recreationResource1Response,
  recreationResource2Response,
  recreationResource3Response,
  recreationResource4Response,
];

const totalRecordIds = [
  { rec_resource_id: "REC0001" },
  { rec_resource_id: "REC0002" },
  { rec_resource_id: "REC0003" },
  { rec_resource_id: "REC0004" },
];

const allActivityCodes = [
  {
    recreation_activity_code: 22,
    with_description: { description: "Snowmobiling" },
  },
  {
    recreation_activity_code: 9,
    with_description: { description: "Picnicking" },
  },
  {
    recreation_activity_code: 1,
    with_description: { description: "Angling" },
  },
  {
    recreation_activity_code: 4,
    with_description: { description: "Kayaking" },
  },
  {
    recreation_activity_code: 3,
    with_description: { description: "Canoeing" },
  },
];

const groupActivityCodes = [
  {
    _count: { recreation_activity_code: 5 },
    recreation_activity_code: 24,
  },
  {
    _count: { recreation_activity_code: 2 },
    recreation_activity_code: 8,
  },
  {
    _count: { recreation_activity_code: 1 },
    recreation_activity_code: 19,
  },
  {
    _count: { recreation_activity_code: 1 },
    recreation_activity_code: 4,
  },
  {
    _count: { recreation_activity_code: 4 },
    recreation_activity_code: 14,
  },
  {
    _count: { recreation_activity_code: 5 },
    recreation_activity_code: 3,
  },
];

const noSearchResultsFilterArray = [
  {
    label: "Things to do",
    options: [
      {
        count: 0,
        description: "Snowmobiling",
        id: 22,
      },
      {
        count: 0,
        description: "Picnicking",
        id: 9,
      },
      {
        count: 0,
        description: "Angling",
        id: 1,
      },
      {
        count: 0,
        description: "Kayaking",
        id: 4,
      },
      {
        count: 0,
        description: "Canoeing",
        id: 3,
      },
    ],
    param: "activities",
    type: "multi-select",
  },
];

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceService,
        {
          provide: PrismaService,

          useValue: {
            $transaction: vi.fn().mockImplementation((res) => res),
            recreation_resource: {
              count: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              groupBy: vi.fn(),
            },
            recreation_activity: {
              findMany: vi.fn(),
              groupBy: vi.fn(),
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
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recresourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      (service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recresourceArray,
          totalRecordIds,
        ])).mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      expect(await service.searchRecreationResources(1, "Rec", 10)).toEqual({
        data: recresourceArrayResolved,
        limit: 10,
        page: 1,
        total: 4,
        filters: [
          {
            label: "Things to do",
            type: "multi-select",
            param: "activities",
            options: [
              {
                count: 0,
                description: "Snowmobiling",
                id: 22,
              },
              {
                count: 0,
                description: "Picnicking",
                id: 9,
              },
              {
                count: 0,
                description: "Angling",
                id: 1,
              },
              {
                count: 1,
                description: "Kayaking",
                id: 4,
              },
              {
                count: 5,
                description: "Canoeing",
                id: 3,
              },
            ],
          },
        ],
      });
    });

    it("should correctly format recreation_activity with_description relation in the results", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recresourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([recresourceArray, totalRecordIds])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(1, "Rec", 10);

      expect(results.data[0].recreation_activity).toEqual(
        recreationResource1Response.recreation_activity,
      );
    });

    it("should return results sorted by name in ascending order", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(orderedRecresourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([orderedRecresourceArray, totalRecordIds])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(1, "", 10);

      expect(results.data[0].name).toEqual("A testing orderBy");
      expect(results.data[1].name).toEqual("Rec site 1");
      expect(results.data[2].name).toEqual("Rec site 2");
      expect(results.data[3].name).toEqual("Z testing orderBy");
    });

    it("should return an empty array if no Recreation Resources are found", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([allActivityCodes, []]);

      await expect(
        service.searchRecreationResources(1, "Rec", 10),
      ).resolves.toEqual({
        data: [],
        limit: 10,
        page: 1,
        total: 0,
        filters: noSearchResultsFilterArray,
      });
    });

    it("should return a filter array with count 0 for each activity if no Recreation Resources are found", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([allActivityCodes, []]);

      const results = await service.searchRecreationResources(1, "Rec", 10);

      expect(results).toEqual({
        data: [],
        limit: 10,
        page: 1,
        total: 0,
        filters: noSearchResultsFilterArray,
      });

      expect(
        service["prisma"].recreation_activity.groupBy,
      ).toHaveBeenCalledWith({
        by: ["recreation_activity_code"],
        _count: { recreation_activity_code: true },
        where: { rec_resource_id: { in: [] } },
      });

      const activityFilter = results.filters[0];

      for (const option of activityFilter.options) {
        expect(option.count).toBe(0);
      }
    });

    it("should return activity filters with correct counts", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recresourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([recresourceArray, totalRecordIds])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        "32",
      );

      const activityFilter = results.filters[0];

      for (const option of activityFilter.options) {
        const group = groupActivityCodes.find(
          (group) => group.recreation_activity_code === option.id,
        );

        expect(option.count).toBe(group?._count.recreation_activity_code || 0);
      }
    });

    it("should return activity filters with correct counts when multiple activities are selected", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recresourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([recresourceArray, totalRecordIds])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        "32_9",
      );

      const activityFilter = results.filters[0];
      console.log(activityFilter);

      for (const option of activityFilter.options) {
        const group = groupActivityCodes.find(
          (group) => group.recreation_activity_code === option.id,
        );

        expect(option.count).toBe(group?._count.recreation_activity_code || 0);
      }
    });

    it("should return activity filters with correct counts when no activities are selected", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recresourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([recresourceArray, totalRecordIds])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(1, "Rec", 10, "");

      const activityFilter = results.filters[0];

      for (const option of activityFilter.options) {
        const group = groupActivityCodes.find(
          (group) => group.recreation_activity_code === option.id,
        );

        expect(option.count).toBe(group?._count.recreation_activity_code || 0);
      }
    });

    it("should return activity filters with correct counts when no activities are found", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recresourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([recresourceArray, totalRecordIds])
        .mockResolvedValueOnce([allActivityCodes, []]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        "99",
      );

      const activityFilter = results.filters[0];

      for (const option of activityFilter.options) {
        expect(option.count).toBe(0);
      }
    });

    it("should throw an error if page is greater than 10 and limit is not provided", async () => {
      await expect(
        service.searchRecreationResources(11, "Rec"),
      ).rejects.toThrow("Maximum page limit is 10 when no limit is provided");
    });
  });
});
