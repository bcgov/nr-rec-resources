import { useGetNextRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetNextRecResourceId';
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

describe('useGetNextRecResourceId', () => {
  const mockGetNextRecResourceId = vi.fn();
  const useRecreationResourceAdminApiClientMock =
    useRecreationResourceAdminApiClient as Mock;
  const useQueryMock = useQuery as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClientMock.mockReturnValue({
      getNextRecResourceId: mockGetNextRecResourceId,
    });
    useQueryMock.mockReturnValue({ status: 'pending' });
  });

  it('wires the next rec resource id query to the admin client', async () => {
    const expectedResult = { rec_resource_id: 'REC000123' };
    mockGetNextRecResourceId.mockResolvedValueOnce(expectedResult);

    renderHook(() => useGetNextRecResourceId({ enabled: true }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['recreation-resource-admin', 'next-rec-resource-id'],
        staleTime: 60 * 1000,
        enabled: true,
      }),
    );

    const queryOptions = useQueryMock.mock.calls[0][0] as {
      queryFn: () => Promise<{ rec_resource_id: string }>;
    };

    await expect(queryOptions.queryFn()).resolves.toEqual(expectedResult);
    expect(mockGetNextRecResourceId).toHaveBeenCalledTimes(1);
  });
});
