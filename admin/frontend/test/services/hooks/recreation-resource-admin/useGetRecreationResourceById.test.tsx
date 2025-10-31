import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useGetRecreationResourceById } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceById';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { Mock, vi } from 'vitest';

// Mock the API client hook and the API itself
vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

// Mock the helper functions
vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
  mapRecreationResourceDetail: (x: any) => x,
}));

describe('useGetRecreationResourceById', () => {
  const mockGetRecreationResourceById = vi.fn();
  const mockApi = { getRecreationResourceById: mockGetRecreationResourceById };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    // Mock createRetryHandler to return a simple retry function
    createRetryHandler.mockReturnValue(() => false); // No retries for simplicity in tests
  });

  it('should not run query if no id is provided', () => {
    const { result } = renderHook(
      () => useGetRecreationResourceById(undefined),
      { wrapper: TestQueryClientProvider },
    );
    expect(result.current.status).toBe('pending');
    expect(mockGetRecreationResourceById).not.toHaveBeenCalled();
  });

  it('should call api.getRecreationResourceById with correct id', async () => {
    mockGetRecreationResourceById.mockResolvedValueOnce({
      id: '123',
      name: 'Test Resource',
    });
    const { result } = renderHook(() => useGetRecreationResourceById('123'), {
      wrapper: TestQueryClientProvider,
    });
    await waitFor(() =>
      expect(result.current.data).toEqual({ id: '123', name: 'Test Resource' }),
    );
    expect(mockGetRecreationResourceById).toHaveBeenCalledWith({
      recResourceId: '123',
    });
  });

  it('should use createRetryHandler for retry logic', () => {
    renderHook(() => useGetRecreationResourceById('123'), {
      wrapper: TestQueryClientProvider,
    });
    expect(createRetryHandler).toHaveBeenCalledWith();
  });
});
