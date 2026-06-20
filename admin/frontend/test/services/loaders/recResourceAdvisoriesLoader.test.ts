import { AuthService } from '@/services/auth';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceAdvisoriesLoader } from '@/services/loaders/recResourceAdvisoriesLoader';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/hooks/recreation-resource-admin/helpers');
vi.mock('@/services/loaders/recResourceLoader', () => ({
  recResourceLoader: vi.fn(),
}));

import { recResourceLoader } from '@/services/loaders/recResourceLoader';

const MOCK_REC_RESOURCE = {
  rec_resource_id: 'REC123',
  name: 'Test Resource',
};

describe('recResourceAdvisoriesLoader', () => {
  let mockAuthService: any;
  let mockApi: any;
  let mockQueryClient: any;
  let mockArgs: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      getToken: vi.fn().mockResolvedValue('mock-token'),
    };
    (AuthService.getInstance as any).mockReturnValue(mockAuthService);

    mockApi = {
      getRecreationResourceAdvisories: vi.fn(),
    };
    (RecreationResourcesApi as any).mockImplementation(function () {
      return mockApi;
    });

    mockQueryClient = {
      ensureQueryData: vi.fn(),
    };

    mockArgs = {
      context: { queryClient: mockQueryClient },
      params: { id: 'REC123' },
    };

    (recResourceLoader as any).mockResolvedValue({
      recResource: MOCK_REC_RESOURCE,
    });

    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls recResourceLoader and merges parentData into the result', async () => {
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    const result = await recResourceAdvisoriesLoader(mockArgs);

    expect(recResourceLoader).toHaveBeenCalledWith(mockArgs);
    expect(result).toMatchObject({ recResource: MOCK_REC_RESOURCE });
  });

  it('calls ensureQueryData with the correct advisories query key', async () => {
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceAdvisoriesLoader(mockArgs);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.advisories('REC123'),
      }),
    );
  });

  it('returns advisories data in the result', async () => {
    const mockAdvisories = [
      { advisory_number: 1001, event_type: 'General Public Safety' },
    ];

    mockQueryClient.ensureQueryData.mockResolvedValue(mockAdvisories);

    const result = await recResourceAdvisoriesLoader(mockArgs);

    expect(result).toEqual({
      recResource: MOCK_REC_RESOURCE,
      advisories: mockAdvisories,
    });
  });

  it('returns empty array when API call throws', async () => {
    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );
    mockApi.getRecreationResourceAdvisories.mockRejectedValue(
      new Error('API error'),
    );

    const result = await recResourceAdvisoriesLoader(mockArgs);

    expect(result.advisories).toEqual([]);
  });

  it('calls API with the correct recResourceId', async () => {
    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );
    mockApi.getRecreationResourceAdvisories.mockResolvedValue([]);

    await recResourceAdvisoriesLoader(mockArgs);

    expect(mockApi.getRecreationResourceAdvisories).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
  });

  it('creates RecreationResourcesApi and gets auth token', async () => {
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceAdvisoriesLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(AuthService.getInstance).toHaveBeenCalled();
  });
});
