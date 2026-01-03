import { AuthService } from '@/services/auth';
import { mapRecreationFee } from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/hooks/recreation-resource-admin/helpers');

const MOCK_REC_RESOURCE = {
  rec_resource_id: 'REC123',
  name: 'Test Resource',
};

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
      getRecreationResourceById: vi.fn(),
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

    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should create RecreationResourcesApi instance and get auth token', async () => {
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceFeesLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(AuthService.getInstance).toHaveBeenCalled();
  });

  it('should call ensureQueryData for fees with correct query key', async () => {
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceFeesLoader(mockArgs);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.fees('REC123'),
      }),
    );
  });

  it('should call ensureQueryData for recResource with correct query key', async () => {
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceFeesLoader(mockArgs);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail('REC123'),
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

    mockApi.getRecreationResourceFees.mockResolvedValue(mockApiFees);
    mockApi.getRecreationResourceById.mockResolvedValue(MOCK_REC_RESOURCE);
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

  it('should return fees and recResource', async () => {
    const mockFees = [{ fee_amount: 15, recreation_fee_code: 'D' }];

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryKey }: any) => {
        if (queryKey[1] === 'fees') {
          return mockFees;
        }
        return MOCK_REC_RESOURCE;
      },
    );

    const result = await recResourceFeesLoader(mockArgs);

    expect(result).toEqual({
      fees: mockFees,
      recResource: MOCK_REC_RESOURCE,
    });
  });

  it('should handle empty fees array', async () => {
    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryKey }: any) => {
        if (queryKey[1] === 'fees') {
          return [];
        }
        return MOCK_REC_RESOURCE;
      },
    );

    const result = await recResourceFeesLoader(mockArgs);

    expect(result).toEqual({
      fees: [],
      recResource: MOCK_REC_RESOURCE,
    });
  });
});
