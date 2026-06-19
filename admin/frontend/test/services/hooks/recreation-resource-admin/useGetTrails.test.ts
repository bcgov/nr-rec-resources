import { useGetTrails } from '@/services/hooks/recreation-resource-admin/useGetTrails';
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

describe('useGetTrails', () => {
  const mockGetTrails = vi.fn();
  const mockApi = { getTrailsByRecResourceId: mockGetTrails };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
  });

  it('should not fetch when recResourceId is empty', () => {
    const { result } = renderHook(() => useGetTrails(''), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.status).toBe('pending');
    expect(mockGetTrails).not.toHaveBeenCalled();
  });

  it('should fetch trails for a valid recResourceId', async () => {
    const mockTrails = [
      {
        recreation_activity_code_trails_id: 1,
        name: 'Trail A',
        trail_type: 'BLUE',
        recreation_activity_code: 34,
      },
      {
        recreation_activity_code_trails_id: 2,
        name: 'Trail B',
        trail_type: null,
        recreation_activity_code: 34,
      },
    ];
    mockGetTrails.mockResolvedValueOnce(mockTrails);

    const { result } = renderHook(() => useGetTrails('REC0001'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTrails);
    expect(mockGetTrails).toHaveBeenCalledWith({ recResourceId: 'REC0001' });
  });

  it('should return error state when the API call fails', async () => {
    mockGetTrails.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGetTrails('REC0001'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
