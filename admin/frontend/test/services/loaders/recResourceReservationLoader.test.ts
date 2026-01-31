import { AuthService } from '@/services/auth';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceReservationLoader } from '@/services/loaders/recResourceReservationLoader';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth');
vi.mock('@/services/recreation-resource-admin');
vi.mock('@/services/hooks/recreation-resource-admin/helpers');

const MOCK_REC_RESOURCE = {
  rec_resource_id: 'REC123',
  name: 'Test Resource',
};

describe('recResourceReservationLoader', () => {
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
      useGetRecreationResourceReservation: vi.fn(),
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

    await recResourceReservationLoader(mockArgs);

    expect(RecreationResourcesApi).toHaveBeenCalled();
    expect(AuthService.getInstance).toHaveBeenCalled();
  });

  it('should call ensureQueryData for fees with correct query key', async () => {
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await recResourceReservationLoader(mockArgs);

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.reservation('REC123'),
      }),
    );
  });

  it('should return reservation and recResource', async () => {
    const mockReservation = {
      rec_resource_id: 'REC123',
      reservation_email: 'email@email.com',
      reservation_website: 'www.website.com',
      reservation_phone_number: '7789787786',
    };

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryKey }: any) => {
        if (queryKey[1] === 'reservation') {
          return mockReservation;
        }
        return MOCK_REC_RESOURCE;
      },
    );

    const result = await recResourceReservationLoader(mockArgs);

    expect(result).toEqual({
      reservationInfo: mockReservation,
      recResource: MOCK_REC_RESOURCE,
    });
  });

  it('should handle null reservation', async () => {
    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryKey }: any) => {
        if (queryKey[1] === 'reservation') {
          return null;
        }
        return MOCK_REC_RESOURCE;
      },
    );

    const result = await recResourceReservationLoader(mockArgs);

    expect(result).toEqual({
      reservationInfo: null,
      recResource: MOCK_REC_RESOURCE,
    });
  });
});
