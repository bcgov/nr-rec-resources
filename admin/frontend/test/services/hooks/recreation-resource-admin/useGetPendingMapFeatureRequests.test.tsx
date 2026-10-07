import { useGetPendingMapFeatureRequests } from '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { Mock, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('useGetPendingMapFeatureRequests', () => {
  const mockGetPendingMapFeatureRequests = vi.fn();
  const useRecreationResourceAdminApiClientMock =
    useRecreationResourceAdminApiClient as Mock;
  const useQueryMock = useQuery as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClientMock.mockReturnValue({
      getPendingMapFeatureRequests: mockGetPendingMapFeatureRequests,
    });
    useQueryMock.mockReturnValue({ status: 'pending' });
  });

  it('wires the pending requests query to the admin client', async () => {
    const expectedResult = { data: [] };
    mockGetPendingMapFeatureRequests.mockResolvedValueOnce(expectedResult);

    renderHook(() => useGetPendingMapFeatureRequests({ enabled: false }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['recreation-resource-admin', 'pending-requests'],
        enabled: false,
      }),
    );

    const queryOptions = useQueryMock.mock.calls[0][0] as {
      queryFn: () => Promise<typeof expectedResult>;
    };

    await expect(queryOptions.queryFn()).resolves.toEqual(expectedResult);
    expect(mockGetPendingMapFeatureRequests).toHaveBeenCalledTimes(1);
  });
});
