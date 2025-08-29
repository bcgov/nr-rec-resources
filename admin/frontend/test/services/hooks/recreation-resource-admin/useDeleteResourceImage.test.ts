import { Mock, vi } from 'vitest';

import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useDeleteResourceImage } from '@/services/hooks/recreation-resource-admin/useDeleteResourceImage';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { reactQueryWrapper } from '@test/test-utils/reactQueryWrapper';
import { renderHook } from '@testing-library/react';

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

describe('useDeleteResourceImage', () => {
  const mockApi = {
    deleteImageResource: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('should return a mutation function', () => {
    const { result } = renderHook(() => useDeleteResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('should configure retry with createRetryHandler', () => {
    renderHook(() => useDeleteResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it('should use the API client for deletion', () => {
    renderHook(() => useDeleteResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });

  it('should call deleteImageResource with correct parameters', async () => {
    const mockParams = {
      recResourceId: 'test-resource-id',
      refId: 'test-image-id',
    };

    mockApi.deleteImageResource.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useDeleteResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    await result.current.mutateAsync(mockParams);

    expect(mockApi.deleteImageResource).toHaveBeenCalledWith(mockParams);
  });
});
