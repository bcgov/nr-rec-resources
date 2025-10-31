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

import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useUploadResourceImage } from '@/services/hooks/recreation-resource-admin/useUploadResourceImage';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook } from '@testing-library/react';

describe('useUploadResourceImage', () => {
  const mockApi = {
    createRecreationresourceImage: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('should return a mutation function', () => {
    const { result } = renderHook(() => useUploadResourceImage(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('should configure retry with createRetryHandler', () => {
    renderHook(() => useUploadResourceImage(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it('should use the API client for upload', () => {
    renderHook(() => useUploadResourceImage(), {
      wrapper: TestQueryClientProvider,
    });

    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });

  it('should call createRecreationresourceImage with correct parameters', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockParams = {
      recResourceId: 'test-resource-id',
      file: mockFile,
      caption: 'test caption',
    };

    mockApi.createRecreationresourceImage.mockResolvedValue({
      id: 'test-image-id',
    });

    const { result } = renderHook(() => useUploadResourceImage(), {
      wrapper: TestQueryClientProvider,
    });

    await result.current.mutateAsync(mockParams);

    expect(mockApi.createRecreationresourceImage).toHaveBeenCalledWith({
      recResourceId: mockParams.recResourceId,
      caption: mockParams.caption,
      file: mockParams.file,
    });
  });
});
