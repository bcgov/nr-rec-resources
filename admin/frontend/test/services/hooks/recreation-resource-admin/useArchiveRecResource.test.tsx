import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useArchiveRecResource } from '@/services/hooks/recreation-resource-admin/useArchiveRecResource';
import {
  useRecreationResourceAdminApiClient,
  createRetryHandler,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';

// Mock dependencies
vi.mock('@/services', () => ({
  useRecreationResourceAdminApiClient: vi.fn(),
  createRetryHandler: vi.fn((config) => config),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

// Match your actual query key structure (includes 'recreation-resource-admin')
vi.mock('./queryKeys', () => ({
  RECREATION_RESOURCE_QUERY_KEYS: {
    detail: vi.fn((id: string) => ['recreation-resource-admin', 'detail', id]),
  },
}));

describe('useArchiveRecResource', () => {
  let queryClient: QueryClient;
  let mockArchiveRecreationResourceById: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockArchiveRecreationResourceById = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useRecreationResourceAdminApiClient).mockReturnValue({
      archiveRecreationResourceById: mockArchiveRecreationResourceById,
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should successfully call api, set query data, and invalidate queries on success', async () => {
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useArchiveRecResource(), { wrapper });

    const recResourceId = 'rec-res-123';

    await result.current.mutateAsync({ recResourceId });

    // Verify API call
    expect(mockArchiveRecreationResourceById).toHaveBeenCalledTimes(1);
    expect(mockArchiveRecreationResourceById).toHaveBeenCalledWith({
      recResourceId,
    });

    // Verify cache updates with correct query key structure
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ['recreation-resource-admin', 'detail', recResourceId],
      undefined,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['recreation-resource-admin', 'detail', recResourceId],
    });
  });

  it('should configure retry handler and trigger error notification on failure', async () => {
    // Render the hook so createRetryHandler gets executed during initialization
    renderHook(() => useArchiveRecResource(), { wrapper });

    // Verify that createRetryHandler was invoked during hook initialization
    expect(createRetryHandler).toHaveBeenCalledTimes(1);

    // Extract the config passed into createRetryHandler to test the onFail callback
    const retryHandlerConfig = vi.mocked(createRetryHandler).mock
      .calls[0][0] as {
      onFail: () => void;
    };

    expect(retryHandlerConfig).toBeDefined();
    expect(typeof retryHandlerConfig.onFail).toBe('function');

    // Manually invoke the onFail callback to verify store notification logic
    retryHandlerConfig.onFail();

    expect(addErrorNotification).toHaveBeenCalledTimes(1);
    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to archive resource after multiple attempts. Please try again later.',
      'updateActivities-error',
    );
  });
});
