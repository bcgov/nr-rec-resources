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
import { ImageVariant } from '@/utils/imageProcessing';
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
    // Create mock variants matching the expected structure
    const mockVariants: ImageVariant[] = [
      {
        sizeCode: 'original',
        blob: new Blob(['original'], { type: 'image/webp' }),
        width: 1920,
        height: 1080,
        file: new File(['original'], 'original.webp', { type: 'image/webp' }),
      },
      {
        sizeCode: 'scr',
        blob: new Blob(['scr'], { type: 'image/webp' }),
        width: 1400,
        height: 800,
        file: new File(['scr'], 'scr.webp', { type: 'image/webp' }),
      },
      {
        sizeCode: 'pre',
        blob: new Blob(['pre'], { type: 'image/webp' }),
        width: 900,
        height: 540,
        file: new File(['pre'], 'pre.webp', { type: 'image/webp' }),
      },
      {
        sizeCode: 'thm',
        blob: new Blob(['thm'], { type: 'image/webp' }),
        width: 250,
        height: 250,
        file: new File(['thm'], 'thm.webp', { type: 'image/webp' }),
      },
    ];

    const mockParams = {
      recResourceId: 'test-resource-id',
      variants: mockVariants,
      fileName: 'test-caption.webp',
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
      fileName: mockParams.fileName,
      original: mockVariants[0].blob,
      scr: mockVariants[1].blob,
      pre: mockVariants[2].blob,
      thm: mockVariants[3].blob,
    });
  });
});
