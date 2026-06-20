import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useGetRecreationResourceAdvisories } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceAdvisories';
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

describe('useGetRecreationResourceAdvisories', () => {
  const mockGetRecreationResourceAdvisories = vi.fn();
  const mockApi = {
    getRecreationResourceAdvisories: mockGetRecreationResourceAdvisories,
  };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  it('does not run query when recResourceId is undefined', () => {
    const { result } = renderHook(
      () => useGetRecreationResourceAdvisories(undefined),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.status).toBe('pending');
    expect(mockGetRecreationResourceAdvisories).not.toHaveBeenCalled();
  });

  it('fetches advisories when recResourceId is provided', async () => {
    const mockAdvisories = [
      { advisory_number: 1001, event_type: 'General Public Safety' },
    ];
    mockGetRecreationResourceAdvisories.mockResolvedValueOnce(mockAdvisories);

    const { result } = renderHook(
      () => useGetRecreationResourceAdvisories('REC123'),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAdvisories);
    expect(mockGetRecreationResourceAdvisories).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
  });

  it('returns empty array when API returns no advisories', async () => {
    mockGetRecreationResourceAdvisories.mockResolvedValueOnce([]);

    const { result } = renderHook(
      () => useGetRecreationResourceAdvisories('REC456'),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('sets isError when API call fails', async () => {
    mockGetRecreationResourceAdvisories.mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { result } = renderHook(
      () => useGetRecreationResourceAdvisories('REC789'),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
