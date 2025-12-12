import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useUpdateActivities } from '@/services/hooks/recreation-resource-admin/useUpdateActivities';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { Mock, vi } from 'vitest';

// Mock the API client hook
vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

// Mock the helper functions
vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

describe('useUpdateActivities', () => {
  const mockUpdateActivities = vi.fn();
  const mockApi = {
    updateActivities: mockUpdateActivities,
  };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call api.updateActivities with correct parameters', async () => {
    const mockResponse = [
      { activity_code: 1, name: 'Activity 1' },
      { activity_code: 2, name: 'Activity 2' },
    ];
    mockUpdateActivities.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateActivities(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        activity_codes: [1, 2],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdateActivities).toHaveBeenCalledWith({
      recResourceId: '123',
      updateActivitiesDto: { activity_codes: [1, 2] },
    });
  });

  it('should update query cache on success', async () => {
    const mockResponse = [
      { activity_code: 1, name: 'Activity 1' },
      { activity_code: 2, name: 'Activity 2' },
    ];
    mockUpdateActivities.mockResolvedValueOnce(mockResponse);

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    const { result } = renderHook(() => useUpdateActivities(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        activity_codes: [1, 2],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify setQueryData was called with correct parameters
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ['recreation-resource-admin', 'activities', '123'],
      mockResponse,
    );
  });

  it('should invalidate main resource query on success', async () => {
    const mockResponse = [{ activity_code: 1, name: 'Activity 1' }];
    mockUpdateActivities.mockResolvedValueOnce(mockResponse);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateActivities(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        activity_codes: [1],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify invalidateQueries was called with correct parameters
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['recreation-resource', '123'],
    });
  });

  it('should use createRetryHandler for retry logic', () => {
    renderHook(() => useUpdateActivities(), {
      wrapper: Wrapper,
    });

    expect(createRetryHandler).toHaveBeenCalledWith({
      onFail: expect.any(Function),
    });
  });

  it('should call addErrorNotification on retry failure', () => {
    const onFailCallback = vi.fn();
    createRetryHandler.mockImplementation(({ onFail }) => {
      onFailCallback.mockImplementation(onFail);
      return () => false;
    });

    renderHook(() => useUpdateActivities(), {
      wrapper: Wrapper,
    });

    // Call the onFail callback
    onFailCallback();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update activities after multiple attempts. Please try again later.',
      'updateActivities-error',
    );
  });

  it('should handle mutation error', async () => {
    const error = new Error('Update failed');
    mockUpdateActivities.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUpdateActivities(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        activity_codes: [1],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
