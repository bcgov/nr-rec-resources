import { recResourceFilesLoader } from '@/services/loaders/recResourceFilesLoader';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { AuthService } from '@/services/auth';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/loaders/recResourceLoader');

describe('recResourceFilesLoader', () => {
  let mockAuthService: any;
  let mockApi: any;
  let mockQueryClient: any;
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      getToken: vi.fn().mockResolvedValue('mock-token'),
    };
    (AuthService.getInstance as any).mockReturnValue(mockAuthService);

    mockApi = {
      getOptionsByTypes: vi.fn().mockResolvedValue([]),
    };
    (RecreationResourcesApi as any).mockImplementation(function () {
      return mockApi;
    });

    mockQueryClient = {
      ensureQueryData: vi.fn().mockResolvedValue([]),
    };

    mockContext = {
      queryClient: mockQueryClient,
    };

    vi.mocked(recResourceLoader).mockResolvedValue({
      recResource: { rec_resource_id: 'REC123' },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls parent recResourceLoader', async () => {
    const args = { context: mockContext, params: { id: 'REC123' } };

    await recResourceFilesLoader(args);

    expect(recResourceLoader).toHaveBeenCalledWith(args);
  });

  it('fetches photographer type options', async () => {
    const args = { context: mockContext, params: { id: 'REC123' } };

    await recResourceFilesLoader(args);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.options([
          GetOptionsByTypesTypesEnum.PhotographerType,
        ]),
      }),
    );
  });

  it('returns parent loader data', async () => {
    const parentData = {
      recResource: { rec_resource_id: 'REC456', name: 'Test' },
    };
    vi.mocked(recResourceLoader).mockResolvedValue(parentData);

    const args = { context: mockContext, params: { id: 'REC456' } };
    const result = await recResourceFilesLoader(args);

    expect(result).toEqual(parentData);
  });
});
