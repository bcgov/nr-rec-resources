import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceService } from "./recreation-resource.service";
import {
  recreationResource1,
  recreationResource1Response,
  recreationResource2Response,
  recreationResource3Response,
  recreationResource4,
  recreationResource4Response,
  recResourceArray,
  orderedRecresourceArray,
  recresourceArrayResolved,
  totalRecordIds,
  allActivityCodes,
  groupActivityCodes,
  recResourceTypeCountsResolved,
  recResourceTypeCounts,
  noSearchResultsFilterArray,
  recreationDistrictCounts,
  recDistrictCountsResolved,
} from "src/recreation-resource/test/mock-data.test";

const recResourceTypeCounts = [
  {
    rec_resource_type_code: "IF",
    description: "Interpretive Forest",
    _count: { recreation_resource: 6 },
  },
  {
    rec_resource_type_code: "RR",
    description: "Recreation Reserve",
    _count: { recreation_resource: 4 },
  },
  {
    rec_resource_type_code: "RTR",
    description: "Recreation Trail",
    _count: { recreation_resource: 37 },
  },
  {
    rec_resource_type_code: "SIT",
    description: "Recreation Site",
    _count: { recreation_resource: 4 },
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
            recreation_resource_type_code: {
              findMany: vi.fn(),
            },
            recreation_district_code: {
              findMany: vi.fn(),
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
      const results = service.formatResults(recResourceArray);

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
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      (service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])).mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      expect(await service.searchRecreationResources(1, "Rec", 10)).toEqual({
        data: recresourceArrayResolved,
        limit: 10,
        page: 1,
        total: 4,
        filters: [
          { ...recDistrictCountsResolved },
          { ...recResourceTypeCountsResolved },
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
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
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
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          orderedRecresourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
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
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          [],
          [],
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
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
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          [],
          [],
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
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

      const activityFilter = results.filters.find(
        (filter) => filter.param === "activities",
      );

      for (const option of activityFilter.options) {
        expect(option.count).toBe(0);
      }
    });

    it("should return activity filters with correct counts", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        "32",
      );

      const activityFilter = results.filters.find(
        (filter) => filter.param === "activities",
      );

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
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        "32_9",
      );

      const activityFilter = results.filters.find(
        (filter) => filter.param === "activities",
      );

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
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(1, "Rec", 10, "");

      const activityFilter = results.filters.find(
        (filter) => filter.param === "activities",
      );

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
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, []]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        "99",
      );

      const activityFilter = results.filters.find(
        (filter) => filter.param === "activities",
      );

      for (const option of activityFilter.options) {
        expect(option.count).toBe(0);
      }
    });

    it("should return a filter array with count and description for each recreation resource type", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        null,
        "SIT",
      );

      const recResourceTypeFilter = results.filters.find(
        (filter) => filter.param === "type",
      );

      expect(recResourceTypeFilter.options[0].count).toBe(6);
      expect(recResourceTypeFilter.options[1].count).toBe(4);
      expect(recResourceTypeFilter.options[2].count).toBe(37);
      expect(recResourceTypeFilter.options[3].count).toBe(4);
      expect(recResourceTypeFilter.options[0].description).toBe(
        "Interpretive Forest",
      );
      expect(recResourceTypeFilter.options[1].description).toBe(
        "Recreation Reserve",
      );
      expect(recResourceTypeFilter.options[2].description).toBe(
        "Recreation Trail",
      );
      expect(recResourceTypeFilter.options[3].description).toBe(
        "Recreation Site",
      );
    });

    it("should return a resource type filter array with correct count and description if no Recreation Resources are found", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          [],
          [],
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, []]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        null,
        "RR",
      );

      const recResourceTypeFilter = results.filters.find(
        (filter) => filter.param === "type",
      );

      expect(recResourceTypeFilter.options[0].count).toBe(6);
      expect(recResourceTypeFilter.options[1].count).toBe(4);
      expect(recResourceTypeFilter.options[2].count).toBe(37);
      expect(recResourceTypeFilter.options[3].count).toBe(4);
      expect(recResourceTypeFilter.options[0].description).toBe(
        "Interpretive Forest",
      );
      expect(recResourceTypeFilter.options[1].description).toBe(
        "Recreation Reserve",
      );
      expect(recResourceTypeFilter.options[2].description).toBe(
        "Recreation Trail",
      );
      expect(recResourceTypeFilter.options[3].description).toBe(
        "Recreation Site",
      );
    });

    it("should throw an error if page is greater than 10 and limit is not provided", async () => {
      await expect(
        service.searchRecreationResources(11, "Rec"),
      ).rejects.toThrow("Maximum page limit is 10 when no limit is provided");
    });

    it("should return a filter array with count and description for each district", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceArray)
        .mockResolvedValueOnce(totalRecordIds);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce(groupActivityCodes);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          recResourceArray,
          totalRecordIds,
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, groupActivityCodes]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        null,
        null,
        "RDMH",
      );

      const recDistrictFilter = results.filters.find(
        (filter) => filter.param === "district",
      );

      expect(recDistrictFilter.options[0].count).toBe(1);
      expect(recDistrictFilter.options[0].description).toBe(
        "100 Mile-Chilcotin",
      );
      expect(recDistrictFilter.options[1].id).toBe("RDCS");

      expect(recDistrictFilter.options[1].count).toBe(0);
      expect(recDistrictFilter.options[1].description).toBe("Cascades");
      expect(recDistrictFilter.options[0].id).toBe("RDMH");

      expect(recDistrictFilter.options[2].count).toBe(0);
      expect(recDistrictFilter.options[2].description).toBe("Chilliwack");
      expect(recDistrictFilter.options[2].id).toBe("RDCK");

      expect(recDistrictFilter.options[3].count).toBe(0);
      expect(recDistrictFilter.options[3].description).toBe("Columbia-Shuswap");
      expect(recDistrictFilter.options[3].id).toBe("RDCO");
    });

    it("should return a district filter array with correct count and description if no Recreation Resources are found", async () => {
      service["prisma"].recreation_resource.findMany = vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_resource_type_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recResourceTypeCounts);
      service["prisma"].recreation_activity.findMany = vi
        .fn()
        .mockResolvedValueOnce(allActivityCodes);
      service["prisma"].recreation_activity.groupBy = vi
        .fn()
        .mockResolvedValueOnce([]);
      service["prisma"].recreation_district_code.findMany = vi
        .fn()
        .mockResolvedValueOnce(recreationDistrictCounts);
      service["prisma"].$transaction = vi
        .fn()
        .mockResolvedValueOnce([
          [],
          [],
          recResourceTypeCounts,
          recreationDistrictCounts,
        ])
        .mockResolvedValueOnce([allActivityCodes, []]);

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        null,
        null,
        "RDMH",
      );

      const recDistrictFilter = results.filters.find(
        (filter) => filter.param === "district",
      );

      expect(recDistrictFilter.options[0].count).toBe(1);
      expect(recDistrictFilter.options[1].count).toBe(0);
      expect(recDistrictFilter.options[2].count).toBe(0);
      expect(recDistrictFilter.options[3].count).toBe(0);
    });
  });
});
