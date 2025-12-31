import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useUpdateFeatures } from '@/services/hooks/recreation-resource-admin/useUpdateFeatures';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
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

describe('useUpdateFeatures', () => {
  const mockUpdateFeatures = vi.fn();
  const mockApi = {
    updateFeatures: mockUpdateFeatures,
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

  it('should call api.updateFeatures with correct parameters', async () => {
    const mockResponse = [
      { feature_code: 'FEATURE1', name: 'Feature 1' },
      { feature_code: 'FEATURE2', name: 'Feature 2' },
    ];
    mockUpdateFeatures.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateFeatures(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        feature_codes: ['FEATURE1', 'FEATURE2'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdateFeatures).toHaveBeenCalledWith({
      recResourceId: '123',
      updateFeaturesDto: { feature_codes: ['FEATURE1', 'FEATURE2'] },
    });
  });

  it('should update query cache on success', async () => {
    const mockResponse = [
      { feature_code: 'FEATURE1', name: 'Feature 1' },
      { feature_code: 'FEATURE2', name: 'Feature 2' },
    ];
    mockUpdateFeatures.mockResolvedValueOnce(mockResponse);

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    const { result } = renderHook(() => useUpdateFeatures(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        feature_codes: ['FEATURE1', 'FEATURE2'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ['recreation-resource-admin', 'features', '123'],
      mockResponse,
    );
  });

  it('should invalidate main resource query on success', async () => {
    const mockResponse = [{ feature_code: 'FEATURE1', name: 'Feature 1' }];
    mockUpdateFeatures.mockResolvedValueOnce(mockResponse);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateFeatures(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        feature_codes: ['FEATURE1'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['recreation-resource', '123'],
    });
  });

  it('should call addErrorNotification on retry failure', () => {
    const onFailCallback = vi.fn();
    createRetryHandler.mockImplementation(({ onFail }) => {
      onFailCallback.mockImplementation(onFail);
      return () => false;
    });

    renderHook(() => useUpdateFeatures(), {
      wrapper: Wrapper,
    });

    onFailCallback();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update features after multiple attempts. Please try again later.',
      'updateFeatures-error',
    );
  });

  it('should handle mutation error', async () => {
    const error = new Error('Update failed');
    mockUpdateFeatures.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUpdateFeatures(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        recResourceId: '123',
        feature_codes: ['FEATURE1'],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
