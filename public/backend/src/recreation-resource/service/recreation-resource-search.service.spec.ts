import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { RecreationResourceSearchService } from "./recreation-resource-search.service";
import { PrismaService } from "src/prisma.service";
import { buildFilterMenu } from "src/recreation-resource/utils/buildFilterMenu";
import { buildSearchFilterQuery } from "src/recreation-resource/utils/buildSearchFilterQuery";
import { formatSearchResults } from "src/recreation-resource/utils/formatSearchResults";
import { buildFilterOptionCountsQuery } from "../utils/buildSearchFilterOptionCountsQuery";
import { buildRecreationResourcePageQuery } from "../utils/buildRecreationResourcePageQuery";

// Mock all dependencies
vi.mock("src/recreation-resource/utils/buildFilterMenu", () => ({
  buildFilterMenu: vi.fn().mockReturnValue({ filters: [] }),
}));

vi.mock("src/recreation-resource/utils/buildSearchFilterQuery", () => ({
  buildSearchFilterQuery: vi.fn().mockReturnValue({ sql: "WHERE 1=1" }),
}));

vi.mock("src/recreation-resource/utils/formatSearchResults", () => ({
  formatSearchResults: vi.fn().mockReturnValue([]),
}));

vi.mock("../utils/buildSearchFilterOptionCountsQuery", () => ({
  buildFilterOptionCountsQuery: vi
    .fn()
    .mockReturnValue({ sql: "SELECT COUNT(*)" }),
}));

vi.mock("../utils/buildRecreationResourcePageQuery", () => ({
  buildRecreationResourcePageQuery: vi
    .fn()
    .mockReturnValue({ sql: "SELECT *" }),
}));

describe("RecreationResourceSearchService", () => {
  let service: RecreationResourceSearchService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = {
      $queryRaw: vi.fn(),
    } as any;
    service = new RecreationResourceSearchService(prismaService);

    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe("searchRecreationResources", () => {
    const mockResourcesResponse = [
      { id: 1, name: "Resource 1", total_count: 10 },
      { id: 2, name: "Resource 2", total_count: 10 },
    ];

    const mockAggregatedCounts = [
      { filter_type: "type", filter_value: "park", count: 5 },
    ];

    beforeEach(() => {
      (prismaService.$queryRaw as Mock).mockImplementation((query) => {
        if (query.sql.includes("COUNT")) {
          return Promise.resolve(mockAggregatedCounts);
        }
        return Promise.resolve(mockResourcesResponse);
      });
    });

    it("should call all utility functions with correct parameters", async () => {
      await service.searchRecreationResources(
        1,
        "search",
        10,
        "hiking",
        "park",
        "north",
        "public",
        "restroom",
      );

      expect(buildSearchFilterQuery).toHaveBeenCalledWith({
        filter: "search",
        activities: "hiking",
        type: "park",
        district: "north",
        access: "public",
        facilities: "restroom",
      });

      expect(buildRecreationResourcePageQuery).toHaveBeenCalled();
      expect(buildFilterOptionCountsQuery).toHaveBeenCalled();
      expect(formatSearchResults).toHaveBeenCalled();
      expect(buildFilterMenu).toHaveBeenCalled();
    });

    it("should validate pagination parameters", async () => {
      await expect(service.searchRecreationResources(11)).rejects.toThrow(
        "Maximum page limit is 10 when no limit is provided",
      );
    });

    it("should normalize take parameter", async () => {
      await service.searchRecreationResources(1, "", 20);

      expect(buildRecreationResourcePageQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        }),
      );
    });

    it("should calculate skip correctly", async () => {
      await service.searchRecreationResources(2, "", 5);

      expect(buildRecreationResourcePageQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 5,
        }),
      );
    });

    it("should return formatted results", async () => {
      const result = await service.searchRecreationResources(1);

      expect(result).toEqual({
        data: [],
        page: 1,
        limit: 10,
        total: 10,
        filters: { filters: [] },
      });
    });

    it("should handle empty results", async () => {
      (prismaService.$queryRaw as Mock).mockResolvedValue([]);

      const result = await service.searchRecreationResources(1);

      expect(result).toEqual({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        filters: { filters: [] },
      });
    });

    it("should determine filter types correctly", async () => {
      await service.searchRecreationResources(1, "", 10, "", "", "", "public");

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.anything(),
        {
          isOnlyAccessFilter: true,
          isOnlyDistrictFilter: false,
          isOnlyTypeFilter: false,
        },
      );
    });

    it("should handle multiple filter types correctly", async () => {
      await service.searchRecreationResources(
        1,
        "",
        10,
        "",
        "park",
        "north",
        "",
      );

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.anything(),
        {
          isOnlyAccessFilter: false,
          isOnlyDistrictFilter: false,
          isOnlyTypeFilter: false,
        },
      );
    });

    it("should correctly identify district-only filter", async () => {
      await service.searchRecreationResources(1, "", 10, "", "", "north", "");

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.anything(),
        {
          isOnlyAccessFilter: false,
          isOnlyDistrictFilter: true,
          isOnlyTypeFilter: false,
        },
      );
    });

    it("should correctly identify type-only filter", async () => {
      await service.searchRecreationResources(1, "", 10, "", "park", "", "");

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.anything(),
        {
          isOnlyAccessFilter: false,
          isOnlyDistrictFilter: false,
          isOnlyTypeFilter: true,
        },
      );
    });

    it("should handle activities and facilities with other filters", async () => {
      await service.searchRecreationResources(
        1,
        "",
        10,
        "hiking",
        "park",
        "",
        "",
        "restroom",
      );

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.anything(),
        {
          isOnlyAccessFilter: false,
          isOnlyDistrictFilter: false,
          isOnlyTypeFilter: false,
        },
      );
    });

    it("should throw error when only latitude is provided", async () => {
      await expect(
        service.searchRecreationResources(1, "", 10, "", "", "", "", "", 10),
      ).rejects.toThrow("Both lat and lon must be provided");
    });

    it("should throw error when only longitude is provided", async () => {
      await expect(
        service.searchRecreationResources(
          1,
          "",
          10,
          "",
          "",
          "",
          "",
          "",
          undefined,
          20,
        ),
      ).rejects.toThrow("Both lat and lon must be provided");
    });
  });
});
