import { searchLoader } from '@/service/loaders/searchLoader';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/service/queries/recreation-resource/queryKeys';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/recreation-resource');
vi.mock('@/service/hooks/helpers', () => ({
  getBasePath: vi.fn(() => 'http://localhost:3000'),
}));
vi.mock('@shared/utils', () => ({
  trackSiteSearch: vi.fn(),
}));
vi.mock('@/utils/buildQueryString', () => ({
  default: vi.fn(() => '?filter=test'),
}));

describe('searchLoader', () => {
  let mockContext: any;
  let mockQueryClient: any;
  let mockLocation: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQueryClient = {
      ensureInfiniteQueryData: vi.fn(),
    };

    mockContext = {
      queryClient: mockQueryClient,
    };

    mockLocation = {
      search: {},
    };

    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('should use correct query key and handle all search parameters', async () => {
    mockLocation.search = {
      filter: 'test',
      district: '123',
      activities: '5',
      access: 'public',
      facilities: 'toilets',
      status: 'open',
      fees: 'free',
      lat: '49.2827',
      lon: '-123.1207',
      community: 'Vancouver',
      type: 'site',
      page: 2,
    };

    mockQueryClient.ensureInfiniteQueryData.mockResolvedValue({});

    await searchLoader({ context: mockContext, location: mockLocation });

    const expectedParams = {
      limit: 10,
      filter: 'test',
      district: '123',
      activities: '5',
      access: 'public',
      facilities: 'toilets',
      status: 'open',
      fees: 'free',
      lat: 49.2827,
      lon: -123.1207,
      community: 'Vancouver',
      type: 'site',
      page: 2,
    };

    expect(mockQueryClient.ensureInfiniteQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.search(expectedParams),
        initialPageParam: expectedParams,
      }),
    );
  });

  it('should convert location coordinates from strings to numbers', async () => {
    mockLocation.search = {
      lat: '50.5',
      lon: '-120.3',
    };

    mockQueryClient.ensureInfiniteQueryData.mockResolvedValue({});

    await searchLoader({ context: mockContext, location: mockLocation });

    expect(mockQueryClient.ensureInfiniteQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining([
          'recreationResources',
          expect.objectContaining({
            lat: 50.5,
            lon: -120.3,
          }),
        ]),
      }),
    );
  });

  it('should return search params', async () => {
    mockLocation.search = { filter: 'test', page: 2 };
    mockQueryClient.ensureInfiniteQueryData.mockResolvedValue({});

    const result = await searchLoader({
      context: mockContext,
      location: mockLocation,
    });

    expect(result.searchParams).toEqual(
      expect.objectContaining({
        filter: 'test',
        page: 2,
        limit: 10,
      }),
    );
  });
});
