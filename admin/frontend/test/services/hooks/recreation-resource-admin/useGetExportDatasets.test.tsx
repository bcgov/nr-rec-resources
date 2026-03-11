import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useGetExportDatasets } from '@/services/hooks/recreation-resource-admin/useGetExportDatasets';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { addErrorNotification } from '@/store/notificationStore';
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

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

describe('useGetExportDatasets', () => {
  const mockGetExportDatasets = vi.fn();
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue({
      getExportDatasets: mockGetExportDatasets,
    });
    createRetryHandler.mockImplementation(() => () => false);
  });

  it('fetches export datasets with the expected query key', async () => {
    const response = {
      datasets: [{ id: 'file-details', label: 'File details', source: 'RST' }],
    };
    mockGetExportDatasets.mockResolvedValue(response);

    const { result } = renderHook(() => useGetExportDatasets(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(response);
    expect(mockGetExportDatasets).toHaveBeenCalledOnce();
  });

  it('honors additional query options', async () => {
    const { result } = renderHook(
      () =>
        useGetExportDatasets({
          enabled: false,
        }),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(result.current.data).toBeUndefined();
    expect(mockGetExportDatasets).not.toHaveBeenCalled();
  });

  it('wires retry failure notifications', () => {
    let onFail: (() => void) | undefined;
    createRetryHandler.mockImplementation((config) => {
      onFail = config.onFail;
      return () => false;
    });

    renderHook(() => useGetExportDatasets(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalledOnce();
    expect(createRetryHandler.mock.calls[0][0]).toMatchObject({
      onFail: expect.any(Function),
    });

    onFail?.();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to load export datasets after multiple attempts. Please try again later.',
      'getExportDatasets-error',
    );
  });

  it('uses the export datasets cache key', async () => {
    const response = { datasets: [] };
    mockGetExportDatasets.mockResolvedValue(response);

    const { result } = renderHook(() => useGetExportDatasets(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      result.current.dataUpdatedAt > 0 &&
        RECREATION_RESOURCE_QUERY_KEYS.exportDatasets(),
    ).toEqual(['recreation-resource-admin', 'exports', 'datasets']);
  });
});
