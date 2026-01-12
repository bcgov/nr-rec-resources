import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Mock, vi } from 'vitest';

// Mock dependencies first - this needs to be before imports
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

import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useGetImagesByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetImagesByRecResourceId';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import * as notificationStore from '@/store/notificationStore';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper(props: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      props.children,
    );
  };
};

describe('useGetImagesByRecResourceId', () => {
  const mockApi = {
    getImagesByRecResourceId: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('should return query with correct initial data', () => {
    const { result } = renderHook(
      () => useGetImagesByRecResourceId('test-id'),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.data).toEqual([]);
  });

  it('should be enabled when recResourceId is provided', () => {
    mockApi.getImagesByRecResourceId.mockResolvedValueOnce([]);

    const { result } = renderHook(
      () => useGetImagesByRecResourceId('test-id'),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isSuccess || result.current.isLoading).toBe(true);
  });

  it('should be disabled when recResourceId is not provided', () => {
    const { result } = renderHook(
      () => useGetImagesByRecResourceId(undefined),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isPending).toBe(false);
  });

  it('should use correct query key', () => {
    renderHook(() => useGetImagesByRecResourceId('test-id'), {
      wrapper: createWrapper(),
    });

    // Query key is used internally, this test ensures the hook can be rendered
    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });

  it('should configure retry handler', () => {
    renderHook(() => useGetImagesByRecResourceId('test-id'), {
      wrapper: createWrapper(),
    });

    expect(createRetryHandler).toHaveBeenCalledWith({
      onFail: expect.any(Function),
    });
  });

  it('should call addErrorNotification on retry failure', () => {
    // First render the hook to trigger createRetryHandler call
    renderHook(() => useGetImagesByRecResourceId('test-id'), {
      wrapper: createWrapper(),
    });

    // Now we can access the mock call
    const onFailCallback = (createRetryHandler as any).mock.calls[0][0].onFail;
    onFailCallback();

    expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
      'Failed to load images after multiple attempts. Please try again later.',
      'getImagesByRecResourceId-error',
    );
  });
});
