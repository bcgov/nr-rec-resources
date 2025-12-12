import { AuthService } from '@/services/auth';
import { mapRecreationFee } from '@/services/hooks/recreation-resource-admin/helpers';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/hooks/recreation-resource-admin/helpers');
vi.mock('@/services/loaders/recResourceLoader');

const MOCK_PARENT_DATA = {
  recResource: {
    rec_resource_id: 'REC123',
    name: 'Test Resource',
  },
};

const MOCK_EMPTY_PARENT_DATA = { recResource: {} };

describe('recResourceFeesLoader', () => {
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
      getRecreationResourceFees: vi.fn(),
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

    await recResourceFeesLoader(mockArgs);

    expect(recResourceLoader).toHaveBeenCalledWith(mockArgs);
  });

  it('should create RecreationResourcesApi instance and get auth token', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceFeesLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(AuthService.getInstance).toHaveBeenCalled();
  });

  it('should call ensureQueryData with correct query key', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceFeesLoader(mockArgs);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['recreation-resource-fees', 'REC123'],
      }),
    );
  });

  it('should fetch fees and apply mapping', async () => {
    const mockApiFees = [
      {
        fee_amount: 15,
        fee_start_date: new Date('2024-05-15'),
        fee_end_date: new Date('2024-10-15'),
        recreation_fee_code: 'D',
      },
      {
        fee_amount: 20,
        fee_start_date: new Date('2024-06-01'),
        fee_end_date: new Date('2024-11-01'),
        recreation_fee_code: 'C',
      },
    ];

    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockApi.getRecreationResourceFees.mockResolvedValue(mockApiFees);
    (mapRecreationFee as any).mockImplementation((fee: any) => ({
      ...fee,
      fee_start_date_readable_utc: 'May 15, 2024',
      fee_end_date_readable_utc: 'October 15, 2024',
    }));

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );

    await recResourceFeesLoader(mockArgs);

    expect(mockApi.getRecreationResourceFees).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
    expect(mapRecreationFee).toHaveBeenCalledTimes(2);
  });

  it('should return merged parent data and fees', async () => {
    const mockFees = [{ fee_amount: 15, recreation_fee_code: 'D' }];

    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue(mockFees);

    const result = await recResourceFeesLoader(mockArgs);

    expect(result).toEqual({
      ...MOCK_PARENT_DATA,
      fees: mockFees,
    });
  });

  it('should handle empty fees array', async () => {
    (recResourceLoader as any).mockResolvedValue(MOCK_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    const result = await recResourceFeesLoader(mockArgs);

    expect(result).toEqual({
      ...MOCK_PARENT_DATA,
      fees: [],
    });
  });

  it('should handle missing VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    (recResourceLoader as any).mockResolvedValue(MOCK_EMPTY_PARENT_DATA);
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    const result = await recResourceFeesLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
