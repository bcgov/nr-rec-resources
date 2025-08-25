import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RecreationResourceSearchService } from './recreation-resource-search.service';
import { PrismaService } from 'src/prisma.service';
import { buildFilterMenu } from 'src/recreation-resource/utils/buildFilterMenu';
import { buildSearchFilterQuery } from 'src/recreation-resource/utils/buildSearchFilterQuery';
import { formatSearchResults } from 'src/recreation-resource/utils/formatSearchResults';
import { buildFilterOptionCountsQuery } from '../utils/buildSearchFilterOptionCountsQuery';
import { buildRecreationResourcePageQuery } from '../utils/buildRecreationResourcePageQuery';

// Mock all dependencies
vi.mock('src/recreation-resource/utils/buildFilterMenu', () => ({
  buildFilterMenu: vi.fn().mockReturnValue({ filters: [] }),
}));

vi.mock('src/recreation-resource/utils/buildSearchFilterQuery', () => ({
  buildSearchFilterQuery: vi.fn().mockReturnValue({ sql: 'WHERE 1=1' }),
}));

vi.mock('src/recreation-resource/utils/formatSearchResults', () => ({
  formatSearchResults: vi.fn().mockReturnValue([]),
}));

vi.mock('../utils/buildSearchFilterOptionCountsQuery', () => ({
  buildFilterOptionCountsQuery: vi
    .fn()
    .mockReturnValue({ sql: 'SELECT COUNT(*)' }),
}));

vi.mock('../utils/buildRecreationResourcePageQuery', () => ({
  buildRecreationResourcePageQuery: vi
    .fn()
    .mockReturnValue({ sql: 'SELECT *' }),
}));

describe('RecreationResourceSearchService', () => {
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

  describe('searchRecreationResources', () => {
    const mockResourcesResponse = [
      { id: 1, name: 'Resource 1', total_count: 10 },
      { id: 2, name: 'Resource 2', total_count: 10 },
    ];

    const mockAggregatedCounts = [
      { filter_type: 'type', filter_value: 'park', count: 5 },
    ];

    beforeEach(() => {
      (prismaService.$queryRaw as Mock).mockImplementation((query) => {
        if (query.sql.includes('COUNT')) {
          return Promise.resolve(mockAggregatedCounts);
        }
        return Promise.resolve(mockResourcesResponse);
      });
    });

    it('should call all utility functions with correct parameters', async () => {
      await service.searchRecreationResources(
        1,
        'search',
        10,
        'hiking',
        'park',
        'north',
        'public',
        'restroom',
        49.1,
        -123.1,
      );

      expect(buildSearchFilterQuery).toHaveBeenCalledWith({
        searchText: 'search',
        activities: 'hiking',
        type: 'park',
        district: 'north',
        access: 'public',
        facilities: 'restroom',
        lat: 49.1,
        lon: -123.1,
      });

      expect(buildRecreationResourcePageQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          whereClause: expect.anything(),
          take: 10,
          skip: 0,
          lat: 49.1,
          lon: -123.1,
        }),
      );
      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          whereClause: expect.anything(),
          searchText: 'search',
          filterTypes: expect.any(Object),
          lat: 49.1,
          lon: -123.1,
        }),
      );
      expect(formatSearchResults).toHaveBeenCalledWith([
        { id: 1, name: 'Resource 1', total_count: 10 },
        { id: 2, name: 'Resource 2', total_count: 10 },
      ]);
      expect(buildFilterMenu).toHaveBeenCalledWith([
        { filter_type: 'type', filter_value: 'park', count: 5 },
      ]);
    });

    it('should validate pagination parameters', async () => {
      await expect(service.searchRecreationResources(11)).rejects.toThrow(
        'Maximum page limit is 10 when no limit is provided',
      );
    });

    it('should normalize take parameter', async () => {
      await service.searchRecreationResources(1, '', 20);

      expect(buildRecreationResourcePageQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        }),
      );
    });

    it('should calculate skip correctly', async () => {
      await service.searchRecreationResources(2, '', 5);

      expect(buildRecreationResourcePageQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 5,
        }),
      );
    });

    it('should return formatted results', async () => {
      const result = await service.searchRecreationResources(1);

      expect(result).toEqual({
        data: [],
        extent: undefined,
        page: 1,
        limit: 10,
        total: 10,
        recResourceIds: [],
        filters: { filters: [] },
      });
      expect(formatSearchResults).toHaveBeenCalledWith([
        { id: 1, name: 'Resource 1', total_count: 10 },
        { id: 2, name: 'Resource 2', total_count: 10 },
      ]);
      expect(buildFilterMenu).toHaveBeenCalledWith([
        { filter_type: 'type', filter_value: 'park', count: 5 },
      ]);
    });

    it('should handle empty results', async () => {
      (prismaService.$queryRaw as Mock).mockResolvedValue([]);

      const result = await service.searchRecreationResources(1);

      expect(result).toEqual({
        data: [],
        extent: undefined,
        page: 1,
        limit: 10,
        total: 0,
        recResourceIds: [],
        filters: { filters: [] },
      });
      expect(formatSearchResults).toHaveBeenCalledWith([]);
      expect(buildFilterMenu).toHaveBeenCalledWith([]);
    });

    it('should determine filter types correctly and pass all params', async () => {
      await service.searchRecreationResources(
        1,
        'foo',
        10,
        '',
        '',
        '',
        'public',
        undefined,
        12,
        34,
      );

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filterTypes: {
            isOnlyAccessFilter: true,
            isOnlyDistrictFilter: false,
            isOnlyTypeFilter: false,
          },
          searchText: 'foo',
          lat: 12,
          lon: 34,
        }),
      );
      expect(buildSearchFilterQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          access: 'public',
          searchText: 'foo',
          lat: 12,
          lon: 34,
        }),
      );
    });

    it('should handle multiple filter types correctly and pass all params', async () => {
      await service.searchRecreationResources(
        1,
        'bar',
        10,
        '',
        'park',
        'north',
        '',
        undefined,
        55,
        66,
      );

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filterTypes: {
            isOnlyAccessFilter: false,
            isOnlyDistrictFilter: false,
            isOnlyTypeFilter: false,
          },
          searchText: 'bar',
          lat: 55,
          lon: 66,
        }),
      );
      expect(buildSearchFilterQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'park',
          district: 'north',
          searchText: 'bar',
          lat: 55,
          lon: 66,
        }),
      );
    });

    it('should correctly identify district-only filter and pass all params', async () => {
      await service.searchRecreationResources(
        1,
        '',
        10,
        '',
        '',
        'north',
        '',
        undefined,
        1,
        2,
      );

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filterTypes: {
            isOnlyAccessFilter: false,
            isOnlyDistrictFilter: true,
            isOnlyTypeFilter: false,
          },
          lat: 1,
          lon: 2,
        }),
      );
      expect(buildSearchFilterQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          district: 'north',
          lat: 1,
          lon: 2,
        }),
      );
    });

    it('should correctly identify type-only filter and pass all params', async () => {
      await service.searchRecreationResources(
        1,
        '',
        10,
        '',
        'park',
        '',
        '',
        undefined,
        3,
        4,
      );

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filterTypes: {
            isOnlyAccessFilter: false,
            isOnlyDistrictFilter: false,
            isOnlyTypeFilter: true,
          },
          lat: 3,
          lon: 4,
        }),
      );
      expect(buildSearchFilterQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'park',
          lat: 3,
          lon: 4,
        }),
      );
    });

    it('should handle activities and facilities with other filters and pass all params', async () => {
      await service.searchRecreationResources(
        1,
        '',
        10,
        'hiking',
        'park',
        '',
        '',
        'restroom',
        7,
        8,
      );

      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filterTypes: {
            isOnlyAccessFilter: false,
            isOnlyDistrictFilter: false,
            isOnlyTypeFilter: false,
          },
          lat: 7,
          lon: 8,
        }),
      );
      expect(buildSearchFilterQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          activities: 'hiking',
          type: 'park',
          facilities: 'restroom',
          lat: 7,
          lon: 8,
        }),
      );
    });

    it('should throw error when only latitude is provided', async () => {
      await expect(
        service.searchRecreationResources(1, '', 10, '', '', '', '', '', 10),
      ).rejects.toThrow('Both lat and lon must be provided');
    });

    it('should throw error when only longitude is provided', async () => {
      await expect(
        service.searchRecreationResources(
          1,
          '',
          10,
          '',
          '',
          '',
          '',
          '',
          undefined,
          20,
        ),
      ).rejects.toThrow('Both lat and lon must be provided');
    });

    it('should pass undefined for optional filters if not provided', async () => {
      await service.searchRecreationResources(1);

      expect(buildSearchFilterQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          searchText: '',
          activities: undefined,
          type: undefined,
          district: undefined,
          access: undefined,
          facilities: undefined,
          lat: undefined,
          lon: undefined,
        }),
      );
      expect(buildRecreationResourcePageQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: undefined,
          lon: undefined,
        }),
      );
      expect(buildFilterOptionCountsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: undefined,
          lon: undefined,
        }),
      );
    });

    it('should propagate errors from prisma.$queryRaw', async () => {
      (prismaService.$queryRaw as Mock).mockRejectedValueOnce(
        new Error('DB error'),
      );
      await expect(service.searchRecreationResources(1)).rejects.toThrow(
        'DB error',
      );
    });
  });

  it('should extract extentGeoJson from filterResults', async () => {
    const mockExtent = '{"type":"Polygon","coordinates":[]}';

    (prismaService.$queryRaw as Mock).mockImplementation((query) => {
      if (query.sql.includes('COUNT')) {
        return Promise.resolve([
          { type: 'ids', rec_resource_ids: ['1', '2'] },
          { type: 'extent', extent: mockExtent },
          { type: 'type', filter_value: 'park', count: 5 },
        ]);
      }
      return Promise.resolve([
        { id: 1, name: 'Resource 1', total_count: 10 },
        { id: 2, name: 'Resource 2', total_count: 10 },
      ]);
    });

    const result = await service.searchRecreationResources(1);

    expect(result.extent).toBe(mockExtent);
  });
});
