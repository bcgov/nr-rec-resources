import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import useUpdateRecreationResourceReservation from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceReservation';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
);

const mockUseRecreationResourceAdminApiClient = vi.mocked(
  useRecreationResourceAdminApiClient,
);

describe('useUpdateRecreationResourceReservation', () => {
  let queryClient: QueryClient;
  const mockApi = {
    updateRecreationResourceReservation: vi.fn(),
  };

  const mockUpdateRequest = {
    recResourceId: 'REC123',
    UpdateRecreationResourceReservationDto: {
      reservation_email: 'newemail@email.com',
    },
  } as any;

  const mockApiResponse = {
    rec_resource_id: 'REC123',
    reservation_email: 'email@email.com',
    reservation_website: 'www.website.com',
    reservation_phone_number: '7789787786',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    mockUseRecreationResourceAdminApiClient.mockReturnValue(mockApi as any);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('updates reservation info with mutation response', async () => {
    mockApi.updateRecreationResourceReservation.mockResolvedValue(
      mockApiResponse,
    );

    const { result } = renderHook(
      () => useUpdateRecreationResourceReservation(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const reservationData = queryClient.getQueryData(
      RECREATION_RESOURCE_QUERY_KEYS.reservation('REC123'),
    );

    expect(reservationData).toEqual(mockApiResponse);
  });
});
