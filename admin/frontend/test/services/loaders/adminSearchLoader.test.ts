import { adminSearchLoader } from '@/services/loaders/adminSearchLoader';
import { AuthService } from '@/services/auth';
import { resolveAdminSearchRouteState } from '@/pages/search/utils/searchSchema';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { getAdminSearchQueryOptions } from '@/services/hooks/recreation-resource-admin/searchQueryOptions';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/pages/search/utils/searchSchema', async () => {
  const actual = await vi.importActual('@/pages/search/utils/searchSchema');
  return {
    ...actual,
    resolveAdminSearchRouteState: vi.fn(),
  };
});
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/hooks/recreation-resource-admin/searchQueryOptions');

describe('adminSearchLoader', () => {
  let mockAuthService: any;
  let mockApi: any;
  let mockContext: any;
  let mockQueryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      getToken: vi.fn().mockResolvedValue('mock-token'),
    };

    (AuthService.getInstance as any).mockReturnValue(mockAuthService);

    mockApi = {
      searchRecreationResources: vi.fn(),
    };

    (RecreationResourcesApi as any).mockImplementation(function () {
      return mockApi;
    });

    mockQueryClient = {
      ensureQueryData: vi.fn(),
    };

    mockContext = {
      queryClient: mockQueryClient,
    };

    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should create RecreationResourcesApi and preload the search query', async () => {
    const resolvedSearch = {
      q: 'lake',
      sort: 'relevance:desc',
      page: 2,
      page_size: 25,
      type: [],
      district: [],
      activities: [],
      status: [],
      access: [],
      defined_campsites: undefined,
      closest_community: '',
      establishment_date_from: undefined,
      establishment_date_to: undefined,
    };
    const queryOptions = {
      queryKey: ['recreation-resource-admin', 'search', { q: 'lake' }],
      queryFn: vi.fn(),
      retry: vi.fn(),
    };

    (resolveAdminSearchRouteState as any).mockReturnValue(resolvedSearch);
    (getAdminSearchQueryOptions as any).mockReturnValue(queryOptions);
    mockQueryClient.ensureQueryData.mockResolvedValue({ data: [], total: 0 });

    await adminSearchLoader({
      context: mockContext,
      deps: { search: { q: 'lake', page: 2 } },
    });

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(resolveAdminSearchRouteState).toHaveBeenCalledWith({
      q: 'lake',
      page: 2,
    });
    expect(getAdminSearchQueryOptions).toHaveBeenCalledWith(
      mockApi,
      resolvedSearch,
    );
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(queryOptions);
  });

  it('should return the prefetched search results', async () => {
    const resolvedSearch = {
      q: '',
      sort: 'relevance:desc',
      page: 1,
      page_size: 10,
      type: [],
      district: [],
      activities: [],
      status: [],
      access: [],
      defined_campsites: undefined,
      closest_community: '',
      establishment_date_from: undefined,
      establishment_date_to: undefined,
    };
    const prefetchedResults = { data: [{ id: 'REC1' }], total: 1 };

    (resolveAdminSearchRouteState as any).mockReturnValue(resolvedSearch);
    (getAdminSearchQueryOptions as any).mockReturnValue({
      queryKey: ['recreation-resource-admin', 'search', {}],
      queryFn: vi.fn(),
      retry: vi.fn(),
    });
    mockQueryClient.ensureQueryData.mockResolvedValue(prefetchedResults);

    const result = await adminSearchLoader({
      context: mockContext,
      deps: { search: {} },
    });

    expect(result).toEqual({ searchResults: prefetchedResults });
  });
});
