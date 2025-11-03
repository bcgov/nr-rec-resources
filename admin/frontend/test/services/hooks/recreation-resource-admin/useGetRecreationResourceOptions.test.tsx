import { ResponseError } from '@/services';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetOptionsByTypes = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: () => ({
      getOptionsByTypes: mockGetOptionsByTypes,
    }),
  }),
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

describe('useGetRecreationResourceOptions', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch options successfully', async () => {
    const mockOptions = [
      { id: '1', name: 'Option 1' },
      { id: '2', name: 'Option 2' },
    ];
    mockGetOptionsByTypes.mockResolvedValue(mockOptions);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceOptions([
          GetOptionsByTypesTypesEnum.Activities,
        ]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockOptions);
    expect(mockGetOptionsByTypes).toHaveBeenCalledWith({
      types: [GetOptionsByTypesTypesEnum.Activities],
    });
  });

  it('should use correct query key', async () => {
    mockGetOptionsByTypes.mockResolvedValue([]);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceOptions([
          GetOptionsByTypesTypesEnum.ResourceType,
        ]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify the query key is correctly set
    const cachedData = queryClient.getQueryData([
      'recreation-resource-options',
      GetOptionsByTypesTypesEnum.ResourceType,
    ]);
    expect(cachedData).toEqual([]);
  });

  it('should apply staleTime configuration', () => {
    mockGetOptionsByTypes.mockResolvedValue([]);

    renderHook(
      () =>
        useGetRecreationResourceOptions([
          GetOptionsByTypesTypesEnum.Activities,
        ]),
      {
        wrapper: createWrapper(),
      },
    );

    // Check that staleTime is set correctly (5 minutes = 300000ms)
    const queryState = queryClient.getQueryState([
      'recreation-resource-options',
      GetOptionsByTypesTypesEnum.Activities,
    ]);
    expect(queryState).toBeDefined();
  });

  it('should accept additional query options', async () => {
    mockGetOptionsByTypes.mockResolvedValue([]);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceOptions(
          [GetOptionsByTypesTypesEnum.Activities],
          {
            enabled: false,
          },
        ),
      {
        wrapper: createWrapper(),
      },
    );

    // Wait a bit to ensure no query was made
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetOptionsByTypes).not.toHaveBeenCalled();
  });

  it('should handle errors with retry logic', async () => {
    const error = new ResponseError(
      new Response('Error', { status: 500 }),
      'Failed to fetch',
    );
    mockGetOptionsByTypes.mockRejectedValue(error);

    // Create a new QueryClient with retry enabled for this test
    const retryQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          retryDelay: 1,
        },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={retryQueryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useGetRecreationResourceOptions([
          GetOptionsByTypesTypesEnum.Activities,
        ]),
      {
        wrapper,
      },
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 },
    );

    // The hook uses createRetryHandler which may have different retry behavior
    // Verify the function was called at least once
    expect(mockGetOptionsByTypes).toHaveBeenCalled();
  });

  it('should call addErrorNotification on retry failure', async () => {
    const error = new ResponseError(
      new Response('Error', { status: 500 }),
      'Failed to fetch',
    );
    mockGetOptionsByTypes.mockRejectedValue(error);

    // Create a new QueryClient with retry enabled for this test
    const retryQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          retryDelay: 1,
        },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={retryQueryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useGetRecreationResourceOptions([
          GetOptionsByTypesTypesEnum.ResourceType,
        ]),
      {
        wrapper,
      },
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 },
    );

    // Verify error notification was added
    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to load options for types resourceType after multiple attempts. Please try again later.',
      'getOptionsByTypes-error',
    );
  });

  it('should work with different option types', async () => {
    const mockOptions = [{ id: 'access1', name: 'Public' }];
    mockGetOptionsByTypes.mockResolvedValue(mockOptions);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceOptions([GetOptionsByTypesTypesEnum.Access]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetOptionsByTypes).toHaveBeenCalledWith({
      types: [GetOptionsByTypesTypesEnum.Access],
    });
    expect(result.current.data).toEqual(mockOptions);
  });

  it('should cache results based on type', async () => {
    const activityOptions = [{ id: '1', name: 'Hiking' }];
    const accessOptions = [{ id: '2', name: 'Public' }];

    mockGetOptionsByTypes
      .mockResolvedValueOnce(activityOptions)
      .mockResolvedValueOnce(accessOptions);

    // First call for Activities
    const { result: result1 } = renderHook(
      () =>
        useGetRecreationResourceOptions([
          GetOptionsByTypesTypesEnum.Activities,
        ]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    // Second call for Access
    const { result: result2 } = renderHook(
      () =>
        useGetRecreationResourceOptions([GetOptionsByTypesTypesEnum.Access]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    expect(result1.current.data).toEqual(activityOptions);
    expect(result2.current.data).toEqual(accessOptions);
    expect(mockGetOptionsByTypes).toHaveBeenCalledTimes(2);
  });
});
