import { mapRecreationResourceDetail } from '@/services/hooks/recreation-resource-admin/helpers';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useUpdateRecreationResource } from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResource';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Helper function to flush promises
const flushPromises = () => new Promise(setImmediate);

// Mock dependencies
vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
);
vi.mock('@/services/hooks/recreation-resource-admin/helpers');

const mockUseRecreationResourceAdminApiClient = vi.mocked(
  useRecreationResourceAdminApiClient,
);
const mockMapRecreationResourceDetail = vi.mocked(mapRecreationResourceDetail);

describe('useUpdateRecreationResource', () => {
  let queryClient: QueryClient;
  const mockApi = {
    updateRecreationResourceById: vi.fn(),
  };

  const mockUpdateRequest = {
    recResourceId: '123',
    updateRecreationResourceDto: {
      maintenance_standard_code: 'LOW',
      status_code: 1,
    },
  };

  const mockApiResponse = {
    rec_resource_id: 123,
    name: 'Updated Resource',
    description: 'Updated Description',
  };

  const mockMappedResponse = {
    rec_resource_id: 123,
    name: 'Updated Resource',
    description: 'Updated Description',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    mockUseRecreationResourceAdminApiClient.mockReturnValue(mockApi as any);
    mockMapRecreationResourceDetail.mockReturnValue(mockMappedResponse as any);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should successfully update recreation resource', async () => {
    // Mock the API response
    mockApi.updateRecreationResourceById.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useUpdateRecreationResource(), {
      wrapper,
    });

    // Initial state
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);

    // Trigger the mutation
    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await flushPromises();
    });

    // Wait for the mutation to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify API was called correctly
    expect(mockApi.updateRecreationResourceById).toHaveBeenCalledWith({
      recResourceId: '123',
      updateRecreationResourceDto: {
        maintenance_standard_code: 'LOW',
        status_code: 1,
      },
    });

    // Verify the response was processed correctly
    expect(mockMapRecreationResourceDetail).toHaveBeenCalledWith(
      mockApiResponse,
    );

    // Check the final state
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockMappedResponse);
  });

  it('should handle update error', async () => {
    const error = new Error('Update failed');
    mockApi.updateRecreationResourceById.mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateRecreationResource(), {
      wrapper,
    });

    // Trigger the mutation
    await act(async () => {
      try {
        result.current.mutate(mockUpdateRequest);
        await flushPromises();
      } catch {
        // Expected to throw
      }
    });

    // Wait for the error state to be set
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify the error state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(error);
  });

  it('should update query cache on success', async () => {
    mockApi.updateRecreationResourceById.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useUpdateRecreationResource(), {
      wrapper,
    });

    // Trigger the mutation
    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await flushPromises();
    });

    // Wait for the mutation to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Check that the query cache was updated
    const cachedData = queryClient.getQueryData(['recreation-resource', '123']);
    expect(cachedData).toEqual(mockMappedResponse);
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useUpdateRecreationResource(), {
      wrapper,
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle pending state during mutation', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    // Mock the API to return our pending promise
    mockApi.updateRecreationResourceById.mockReturnValue(pendingPromise as any);

    const { result } = renderHook(() => useUpdateRecreationResource(), {
      wrapper,
    });

    // Initial state
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);

    // Start the mutation
    act(() => {
      result.current.mutate(mockUpdateRequest);
    });

    // Wait for the pending state to be set
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Verify the pending state
    expect(result.current.isSuccess).toBe(false);

    // Resolve the promise
    await act(async () => {
      resolvePromise(mockApiResponse);
      await new Promise((resolve) => process.nextTick(resolve));
    });

    // Wait for the success state
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the final state
    expect(result.current.isPending).toBe(false);
  });
});
