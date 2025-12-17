import { AuthService } from '@/services/auth';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceGeospatialLoader } from '@/services/loaders/recResourceGeospatialLoader';
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

describe('recResourceGeospatialLoader', () => {
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
      getRecreationResourceGeospatial: vi.fn(),
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
    mockQueryClient.ensureQueryData.mockResolvedValue(null);

    await recResourceGeospatialLoader(mockArgs);

    expect(recResourceLoader).toHaveBeenCalledWith(mockArgs);
  });

  it('should create RecreationResourcesApi instance and get auth token', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue(null);

    await recResourceGeospatialLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(AuthService.getInstance).toHaveBeenCalled();
  });

  it('should call ensureQueryData with correct query key', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue(null);

    await recResourceGeospatialLoader(mockArgs);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.geospatial('REC123'),
      }),
    );
  });

  it('should fetch geospatial data via api.getRecreationResourceGeospatial', async () => {
    const mockGeospatialData = {
      rec_resource_id: 'REC123',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
      latitude: 49.123456,
      longitude: -123.654321,
    };

    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockApi.getRecreationResourceGeospatial.mockResolvedValue(
      mockGeospatialData,
    );

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );

    await recResourceGeospatialLoader(mockArgs);

    expect(mockApi.getRecreationResourceGeospatial).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
  });

  it('should return merged parent data and geospatialData', async () => {
    const mockGeospatialData = {
      rec_resource_id: 'REC123',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
    };

    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue(mockGeospatialData);

    const result = await recResourceGeospatialLoader(mockArgs);

    expect(result).toEqual({
      ...MOCK_PARENT_DATA,
      geospatialData: mockGeospatialData,
    });
  });

  it('should handle 404 errors by returning null', async () => {
    const error404 = {
      status: 404,
      response: { status: 404 },
    };

    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockRejectedValue(error404);

    const result = await recResourceGeospatialLoader(mockArgs);

    expect(result).toEqual({
      ...MOCK_PARENT_DATA,
      geospatialData: null,
    });
  });

  it('should handle missing VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue(null);

    const result = await recResourceGeospatialLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
