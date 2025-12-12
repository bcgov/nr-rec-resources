import { AuthService } from '@/services/auth';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceActivitiesLoader } from '@/services/loaders/recResourceActivitiesLoader';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/loaders/recResourceLoader');

const MOCK_PARENT_DATA = {
  recResource: {
    rec_resource_id: 'REC123',
    name: 'Test Resource',
  },
};

const MOCK_EMPTY_PARENT_DATA = { recResource: {} };

describe('recResourceActivitiesLoader', () => {
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
      getActivitiesByRecResourceId: vi.fn(),
    };
    (RecreationResourcesApi as any).mockImplementation(() => mockApi);

    mockQueryClient = {
      ensureQueryData: vi.fn(),
    };

    mockArgs = {
      context: { queryClient: mockQueryClient },
      params: { id: 'REC123' },
    };

    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should call parent loader to get recResource data', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceActivitiesLoader(mockArgs);

    expect(recResourceLoader).toHaveBeenCalledWith(mockArgs);
  });

  it('should create RecreationResourcesApi instance and get auth token', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceActivitiesLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(AuthService.getInstance).toHaveBeenCalled();
  });

  it('should call ensureQueryData with correct query key', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceActivitiesLoader(mockArgs);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.activities('REC123'),
      }),
    );
  });

  it('should fetch activities by rec resource id', async () => {
    const mockActivities = [
      { recreation_activity_code: 1, description: 'Hiking' },
      { recreation_activity_code: 2, description: 'Camping' },
    ];

    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockApi.getActivitiesByRecResourceId.mockResolvedValue(mockActivities);

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );

    await recResourceActivitiesLoader(mockArgs);

    expect(mockApi.getActivitiesByRecResourceId).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
  });

  it('should return merged parent data and activities', async () => {
    const mockActivities = [
      { recreation_activity_code: 1, description: 'Hiking' },
    ];

    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue(mockActivities);

    const result = await recResourceActivitiesLoader(mockArgs);

    expect(result).toEqual({
      ...MOCK_PARENT_DATA,
      activities: mockActivities,
    });
  });

  it('should handle empty activities array', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    const result = await recResourceActivitiesLoader(mockArgs);

    expect(result).toEqual({
      ...MOCK_PARENT_DATA,
      activities: [],
    });
  });

  it('should handle missing VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    const result = await recResourceActivitiesLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
