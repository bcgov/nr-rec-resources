import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { AuthService } from '@/services/auth';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { mapRecreationResourceDetail } from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/hooks/recreation-resource-admin/helpers');

describe('recResourceLoader', () => {
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
      getRecreationResourceById: vi.fn(),
    };

    (RecreationResourcesApi as any).mockImplementation(() => mockApi);

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

  it('should create RecreationResourcesApi instance', async () => {
    const params = { id: 'REC123' };
    mockQueryClient.ensureQueryData.mockResolvedValue({});

    await recResourceLoader({ context: mockContext, params });

    expect(RecreationResourcesApi).toHaveBeenCalled();
  });

  it('should get auth token from AuthService', async () => {
    const params = { id: 'REC123' };
    mockQueryClient.ensureQueryData.mockResolvedValue({});

    await recResourceLoader({ context: mockContext, params });

    expect(AuthService.getInstance).toHaveBeenCalled();
  });

  it('should call ensureQueryData with correct query key', async () => {
    const params = { id: 'REC123' };
    mockQueryClient.ensureQueryData.mockResolvedValue({});

    await recResourceLoader({ context: mockContext, params });

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail('REC123'),
      }),
    );
  });

  it('should fetch recreation resource by id and map the result', async () => {
    const params = { id: 'REC456' };
    const mockApiResponse = {
      rec_resource_id: 'REC456',
      name: 'Test Resource',
    };
    const mockMappedResponse = {
      rec_resource_id: 'REC456',
      name: 'Test Resource',
      maintenance_standard_description: 'Maintained',
    };

    mockApi.getRecreationResourceById.mockResolvedValue(mockApiResponse);
    (mapRecreationResourceDetail as any).mockReturnValue(mockMappedResponse);

    mockQueryClient.ensureQueryData.mockImplementation(async ({ queryFn }) => {
      return await queryFn();
    });

    await recResourceLoader({ context: mockContext, params });

    expect(mockApi.getRecreationResourceById).toHaveBeenCalledWith({
      recResourceId: 'REC456',
    });
    expect(mapRecreationResourceDetail).toHaveBeenCalledWith(mockApiResponse);
  });

  it('should return the rec resource data', async () => {
    const params = { id: 'REC789' };
    const mockRecResource = {
      rec_resource_id: 'REC789',
      name: 'Test Resource',
    };

    mockQueryClient.ensureQueryData.mockResolvedValue(mockRecResource);

    const result = await recResourceLoader({ context: mockContext, params });

    expect(result).toEqual({ recResource: mockRecResource });
  });
});
