import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceService } from "./recreation-resource.service";
import {
  activityCounts,
  activityCountsNoResults,
  noSearchResultsFilterArray,
  orderedRecresourceArray,
  recreationAccessCounts,
  recreationDistrictCounts,
  recreationResource1,
  recreationResource1Response,
  recreationResource2Response,
  recreationResource3Response,
  recreationResource4,
  recreationResource4Response,
  recResourceArray,
  recresourceArrayResolved,
  recResourceTypeCounts,
  searchResultsFilterArray,
  totalRecordIds,
  recreationStructureCountsArray,
} from "src/recreation-resource/test/mock-data.test";

type ResponseInputs = {
  recreation_resource?: object;
  recreation_resource_total_ids?: object;
  recreation_resource_type_code?: object;
  recreation_district_code?: object;
  recreation_access_code?: object[];
  recreation_activity_code?: object[];
  recreation_structure_toilet_count?: object[];
  recreation_structure_table_count?: object[];
};

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
            recreation_access_code: {
              findMany: vi.fn(),
            },
            recreation_activity_code: {
              findMany: vi.fn(),
            },
            recreation_structure: {
              findMany: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
  });

  // Pass in an object with the properties you want to override to test different search results
  const buildSearchResponse = (responseInput: ResponseInputs) => {
    const {
      recreation_resource,
      recreation_resource_total_ids,
      recreation_resource_type_code,
      recreation_district_code,
      recreation_access_code,
      recreation_activity_code,
      recreation_structure_toilet_count,
      recreation_structure_table_count,
    } = responseInput;
    service["prisma"].recreation_resource.findMany = vi
      .fn()
      .mockResolvedValueOnce(recreation_resource ?? recResourceArray)
      .mockResolvedValueOnce(recreation_resource_total_ids ?? totalRecordIds);
    service["prisma"].recreation_resource_type_code.findMany = vi
      .fn()
      .mockResolvedValueOnce(
        recreation_resource_type_code ?? recResourceTypeCounts,
      );
    service["prisma"].recreation_district_code.findMany = vi
      .fn()
      .mockResolvedValueOnce(
        recreation_district_code ?? recreationDistrictCounts,
      );
    service["prisma"].recreation_access_code.findMany = vi
      .fn()
      .mockResolvedValueOnce(recreation_access_code ?? recreationAccessCounts);
    service["prisma"].recreation_activity_code.findMany = vi
      .fn()
      .mockResolvedValueOnce(recreation_activity_code ?? activityCounts);
    service["prisma"].recreation_structure.findMany = vi
      .fn()
      .mockResolvedValueOnce(
        recreation_structure_toilet_count ?? [
          ...recreationStructureCountsArray,
        ],
      )
      .mockResolvedValueOnce(
        recreation_structure_table_count ?? [
          ...recreationStructureCountsArray.slice(0, 9),
        ],
      );

    service["prisma"].$transaction = vi
      .fn()
      .mockResolvedValueOnce([
        recreation_resource ?? recResourceArray,
        recreation_resource_total_ids ?? totalRecordIds,
        recreation_district_code ?? recreationDistrictCounts,
      ])
      .mockResolvedValueOnce([
        recreation_access_code ?? recreationAccessCounts,
        recreation_resource_type_code ?? recResourceTypeCounts,
        recreation_activity_code ?? activityCounts,
        recreation_structure_toilet_count ?? 10,
        recreation_structure_table_count ?? 10,
      ]);
  };

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("formatResults function", () => {
    it("should correctly format recreation_activity recreation_activity relation in the results", () => {
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

    it("should correctly format recreation_activity recreation_activity relation in the response", async () => {
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
      buildSearchResponse({});

      expect(await service.searchRecreationResources(1, "Rec", 10)).toEqual({
        data: recresourceArrayResolved,
        limit: 10,
        page: 1,
        total: 4,
        filters: searchResultsFilterArray,
      });
    });

    it("should correctly format recreation_activity recreation_activity relation in the results", async () => {
      buildSearchResponse({});

      const results = await service.searchRecreationResources(1, "Rec", 10);

      expect(results.data[0].recreation_activity).toEqual(
        recreationResource1Response.recreation_activity,
      );
    });

    it("should return results sorted by name in ascending order", async () => {
      buildSearchResponse({
        recreation_resource: orderedRecresourceArray,
      });

      const results = await service.searchRecreationResources(1, "", 10);

      expect(results.data[0].name).toEqual("A testing orderBy");
      expect(results.data[1].name).toEqual("Rec site 1");
      expect(results.data[2].name).toEqual("Rec site 2");
      expect(results.data[3].name).toEqual("Z testing orderBy");
    });

    it("should return an empty array if no Recreation Resources are found", async () => {
      buildSearchResponse({
        recreation_resource: [],
        recreation_resource_total_ids: [],
        recreation_structure_table_count: [],
        recreation_structure_toilet_count: [],
        recreation_activity_code: activityCountsNoResults,
      });

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
      buildSearchResponse({
        recreation_resource: [],
        recreation_resource_total_ids: [],
        recreation_resource_type_code: recResourceTypeCounts,
        recreation_district_code: recreationDistrictCounts,
        recreation_access_code: recreationAccessCounts,
        recreation_activity_code: activityCountsNoResults,
        recreation_structure_table_count: [],
        recreation_structure_toilet_count: [],
      });

      const results = await service.searchRecreationResources(1, "Rec", 10);

      expect(results).toEqual({
        data: [],
        limit: 10,
        page: 1,
        total: 0,
        filters: noSearchResultsFilterArray,
      });

      expect(
        service["prisma"].recreation_activity_code.findMany,
      ).toHaveBeenCalledWith({
        select: {
          recreation_activity_code: true,
          description: true,
          _count: {
            select: {
              recreation_activity: {
                where: {
                  rec_resource_id: {
                    in: [],
                  },
                },
              },
            },
          },
        },
        where: {
          recreation_activity_code: {
            notIn: [26],
          },
        },
        orderBy: {
          description: "asc",
        },
      });

      const activityFilter = results.filters.find(
        (filter) => filter.param === "activities",
      );

      for (const option of activityFilter.options) {
        expect(option.count).toBe(0);
      }
    });

    it("should return activity filters with correct counts", async () => {
      buildSearchResponse({});

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
        const group = activityCounts.find(
          (group) => group.recreation_activity_code.toString() === option.id,
        );

        expect(option.count).toBe(group?._count.recreation_activity || 0);
      }
    });

    it("should return activity filters with correct counts when multiple activities are selected", async () => {
      buildSearchResponse({});

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
        const group = activityCounts.find(
          (group) => group.recreation_activity_code.toString() === option.id,
        );

        expect(option.count).toBe(group?._count.recreation_activity || 0);
      }
    });

    it("should return activity filters with correct counts when no activities are selected", async () => {
      buildSearchResponse({});

      const results = await service.searchRecreationResources(1, "Rec", 10, "");

      const activityFilter = results.filters.find(
        (filter) => filter.param === "activities",
      );

      for (const option of activityFilter.options) {
        const group = activityCounts.find(
          (group) => group.recreation_activity_code.toString() === option.id,
        );

        expect(option.count).toBe(group?._count.recreation_activity || 0);
      }
    });

    it("should return activity filters with correct counts when no activities are found", async () => {
      buildSearchResponse({
        recreation_activity_code: [],
      });

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
      buildSearchResponse({});

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
      buildSearchResponse({
        recreation_resource: [],
        recreation_resource_total_ids: [],
        recreation_resource_type_code: recResourceTypeCounts,
        recreation_district_code: recreationDistrictCounts,
        recreation_access_code: recreationAccessCounts,
      });

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
      buildSearchResponse({});

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
      buildSearchResponse({
        recreation_resource: [],
        recreation_resource_total_ids: [],
        recreation_resource_type_code: recResourceTypeCounts,
        recreation_district_code: recreationDistrictCounts,
      });

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

    it("should return a filter array with count and description for each access code", async () => {
      buildSearchResponse({});

      const results = await service.searchRecreationResources(1, "Rec", 10);

      const recAccessFilter = results.filters.find(
        (filter) => filter.param === "access",
      );

      expect(recAccessFilter.options[0].count).toBe(17);
      expect(recAccessFilter.options[0].description).toBe("Boat-in Access");

      expect(recAccessFilter.options[1].count).toBe(13);
      expect(recAccessFilter.options[1].description).toBe("Fly-in Access");

      expect(recAccessFilter.options[2].count).toBe(16);
      expect(recAccessFilter.options[2].description).toBe("Road Access");

      expect(recAccessFilter.options[3].count).toBe(17);
      expect(recAccessFilter.options[3].description).toBe("Trail Access");
    });

    it("should return the correct count for access if a filter is applied", async () => {
      buildSearchResponse({
        recreation_access_code: [
          {
            recreation_access_code: "B",
            description: "Boat-in Access",
            _count: { recreation_access: 17 },
          },
          {
            recreation_access_code: "F",
            description: "Fly-in Access",
            _count: { recreation_access: 0 },
          },
          {
            recreation_access_code: "R",
            description: "Road Access",
            _count: { recreation_access: 0 },
          },
          {
            recreation_access_code: "T",
            description: "Trail Access",
            _count: { recreation_access: 0 },
          },
        ],
      });

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        null,
        null,
        null,
        "B",
      );

      const recAccessFilter = results.filters.find(
        (filter) => filter.param === "access",
      );

      expect(recAccessFilter.options[0].count).toBe(17);
      expect(recAccessFilter.options[1].count).toBe(0);
      expect(recAccessFilter.options[2].count).toBe(0);
      expect(recAccessFilter.options[3].count).toBe(0);
    });

    it("should return an access filter array with correct count and description if no Recreation Resources are found", async () => {
      buildSearchResponse({
        recreation_resource: [],
        recreation_resource_total_ids: [],
      });

      const results = await service.searchRecreationResources(1, "Rec", 10);

      const recAccessFilter = results.filters.find(
        (filter) => filter.param === "access",
      );

      expect(recAccessFilter.options[0].count).toBe(17);
      expect(recAccessFilter.options[1].count).toBe(13);
      expect(recAccessFilter.options[2].count).toBe(16);
      expect(recAccessFilter.options[3].count).toBe(17);
    });

    it("should return a filter array with facilities count", async () => {
      buildSearchResponse({});

      const results = await service.searchRecreationResources(1, "Rec", 10);

      const facilitiesFilter = results.filters.find(
        (filter) => filter.param === "facilities",
      );

      expect(facilitiesFilter.options[0].description).toBe("Toilets");
      expect(facilitiesFilter.options[1].description).toBe("Tables");

      expect(facilitiesFilter.options[0].count).toBe(10);
      expect(facilitiesFilter.options[1].count).toBe(9);
    });

    it("should return the proper facilities filter array if no Recreation Resources are found", async () => {
      buildSearchResponse({
        recreation_resource: [],
        recreation_resource_total_ids: [],
        recreation_structure_toilet_count: [],
        recreation_structure_table_count: [],
      });

      const results = await service.searchRecreationResources(1, "Rec", 10);

      const facilitiesFilter = results.filters.find(
        (filter) => filter.param === "facilities",
      );

      expect(facilitiesFilter.options[0].count).toBe(0);
      expect(facilitiesFilter.options[1].count).toBe(0);
    });

    it("should return the correct facilities filter array if a filter is applied", async () => {
      buildSearchResponse({
        recreation_structure_toilet_count: [...recreationStructureCountsArray],
        recreation_structure_table_count: [],
      });

      const results = await service.searchRecreationResources(
        1,
        "Rec",
        10,
        null,
        null,
        null,
        null,
        "toilet",
      );

      const facilitiesFilter = results.filters.find(
        (filter) => filter.param === "facilities",
      );

      expect(facilitiesFilter.options[0].count).toBe(10);
      expect(facilitiesFilter.options[1].count).toBe(0);
    });
  });
});
