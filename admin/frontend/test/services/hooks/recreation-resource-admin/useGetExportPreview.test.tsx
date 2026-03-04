import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useGetExportPreview } from '@/services/hooks/recreation-resource-admin/useGetExportPreview';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { addErrorNotification } from '@/store/notificationStore';
import { createTestQueryClient } from '@shared/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
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

describe('useGetExportPreview', () => {
  const mockGetExportPreview = vi.fn();
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue({
      getExportPreview: mockGetExportPreview,
    });
    createRetryHandler.mockImplementation(() => () => false);
  });

  const createWrapper = () => {
    const queryClient = createTestQueryClient();

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('does not fetch when no dataset is selected', () => {
    const { result } = renderHook(() => useGetExportPreview(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetExportPreview).not.toHaveBeenCalled();
  });

  it('fetches and maps preview responses', async () => {
    mockGetExportPreview.mockResolvedValue({
      columns: ['NAME'],
      rows: [{ NAME: 'Alpha' }],
      ignored: true,
    });

    const { result } = renderHook(
      () =>
        useGetExportPreview({
          dataset: 'file-details',
          district: 'RDKA',
          resourceType: 'SIT',
          limit: 50,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetExportPreview).toHaveBeenCalledWith({
      dataset: 'file-details',
      district: 'RDKA',
      resourceType: 'SIT',
      limit: 50,
    });
    expect(result.current.data).toEqual({
      columns: ['NAME'],
      rows: [{ NAME: 'Alpha' }],
    });
  });

  it('throws when the query function runs without a dataset', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useGetExportPreview({ dataset: '' }), {
      wrapper,
    });

    const query = queryClient.getQueryCache().find({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.exportPreview({ dataset: '' }),
    });

    await expect(query?.options.queryFn?.({} as never)).rejects.toThrow(
      'A dataset is required to load an export preview.',
    );
  });

  it('wires retry failure notifications', () => {
    let onFail: (() => void) | undefined;
    createRetryHandler.mockImplementation((config) => {
      onFail = config.onFail;
      return () => false;
    });

    renderHook(
      () =>
        useGetExportPreview({
          dataset: 'file-details',
        }),
      {
        wrapper: createWrapper(),
      },
    );

    onFail?.();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to load the export preview after multiple attempts. Please try again later.',
      'getExportPreview-error',
    );
  });
});
