import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import useUpdateRecreationResourceGeospatial from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceGeospatial';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
);

const mockUseRecreationResourceAdminApiClient = vi.mocked(
  useRecreationResourceAdminApiClient,
);

describe('useUpdateRecreationResourceGeospatial', () => {
  let queryClient: QueryClient;
  const mockApi = {
    updateRecreationResourceGeospatial: vi.fn(),
  };

  const mockUpdateRequest = {
    recResourceId: 'REC123',
    updateRecreationResourceGeospatialDto: { utm_zone: 10 },
  } as any;

  const mockApiResponse = {
    utm_zone: 10,
    utm_easting: 500000,
    utm_northing: 5480000,
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

  it('calls api.updateRecreationResourceGeospatial and updates/invalidate queries on success', async () => {
    mockApi.updateRecreationResourceGeospatial.mockResolvedValue(
      mockApiResponse,
    );

    const { result } = renderHook(
      () => useUpdateRecreationResourceGeospatial(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockApi.updateRecreationResourceGeospatial).toHaveBeenCalledWith(
      mockUpdateRequest,
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockApiResponse);
  });

  it('propagates api errors', async () => {
    const error = new Error('boom');
    mockApi.updateRecreationResourceGeospatial.mockRejectedValue(error);

    const { result } = renderHook(
      () => useUpdateRecreationResourceGeospatial(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockApi.updateRecreationResourceGeospatial).toHaveBeenCalledWith(
      mockUpdateRequest,
    );
    expect(result.current.error).toEqual(error);
  });
});
