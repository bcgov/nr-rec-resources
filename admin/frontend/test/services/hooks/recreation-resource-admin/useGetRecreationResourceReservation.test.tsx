import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useGetRecreationResourceReservation } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceReservation';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { Mock, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

describe('useGetRecreationResourceReservation', () => {
  const mockGetRecreationResourceReservation = vi.fn();
  const mockApi = {
    getRecreationResourceReservation: mockGetRecreationResourceReservation,
  };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  it('should not run query if no recResourceId is provided', () => {
    const { result } = renderHook(
      () => useGetRecreationResourceReservation(undefined),
      { wrapper: TestQueryClientProvider },
    );
    expect(result.current.status).toBe('pending');
    expect(mockGetRecreationResourceReservation).not.toHaveBeenCalled();
  });

  it('should call api.getRecreationResourceReservation with correct recResourceId when enabled', async () => {
    mockGetRecreationResourceReservation.mockResolvedValueOnce({
      rec_resource_id: 'REC123',
      reservation_email: 'email@email.com',
      reservation_website: 'www.website.com',
      reservation_phone_number: '7789787786',
    });
    const { result } = renderHook(
      () => useGetRecreationResourceReservation('REC123'),
      {
        wrapper: TestQueryClientProvider,
      },
    );
    await waitFor(() =>
      expect(result.current.data).toEqual({
        rec_resource_id: 'REC123',
        reservation_email: 'email@email.com',
        reservation_website: 'www.website.com',
        reservation_phone_number: '7789787786',
      }),
    );
    expect(mockGetRecreationResourceReservation).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
  });

  it('should return reservation data on success', async () => {
    const mockReservationData = {
      rec_resource_id: 'REC123',
      reservation_email: 'email@email.com',
      reservation_website: 'www.website.com',
      reservation_phone_number: '7789787786',
    };

    mockGetRecreationResourceReservation.mockResolvedValueOnce(
      mockReservationData,
    );
    const { result } = renderHook(
      () => useGetRecreationResourceReservation('REC456'),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockReservationData);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle 404 errors by returning null', async () => {
    const error404 = {
      status: 404,
      response: { status: 404 },
    };

    mockGetRecreationResourceReservation.mockRejectedValueOnce(error404);
    const { result } = renderHook(
      () => useGetRecreationResourceReservation('REC789'),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
