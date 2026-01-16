import { useImageUpload } from '@/pages/rec-resource-page/hooks/useImageUpload';
import { processImageToVariants } from '@/utils/imageProcessing';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFile,
  createMockGalleryFile,
  createMockImageVariants,
  createQueryClientWrapper,
} from './test-utils/upload-delete-test-utils';

// Mock the dependencies
vi.mock('@/pages/rec-resource-page/hooks/useRecResource');
vi.mock('@/services/hooks/recreation-resource-admin/useUploadResourceImage');
vi.mock('@/utils/imageProcessing');
vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  addPendingImage: vi.fn(),
  removePendingImage: vi.fn(),
  updatePendingImage: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/validateUpload', () => ({
  validateUploadFile: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/useFileUpload', () => ({
  useFileUpload: vi.fn(),
}));

import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useFileUpload } from '@/pages/rec-resource-page/hooks/utils/useFileUpload';
import { validateUploadFile } from '@/pages/rec-resource-page/hooks/utils/validateUpload';
import { useUploadResourceImage } from '@/services/hooks/recreation-resource-admin/useUploadResourceImage';

const mockExecuteUpload = vi.fn();
const mockProcessImageToVariants = vi.mocked(processImageToVariants);

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRecResource).mockReturnValue({
      recResource: { rec_resource_id: 'test-rec-resource-id' },
      rec_resource_id: 'test-rec-resource-id',
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUploadResourceImage).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(useFileUpload).mockReturnValue({
      executeUpload: mockExecuteUpload,
    } as any);

    vi.mocked(validateUploadFile).mockReturnValue(true);
    mockProcessImageToVariants.mockResolvedValue(createMockImageVariants());
  });

  it('returns upload handlers', () => {
    const { result } = renderHook(() => useImageUpload(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current).toMatchObject({
      handleUpload: expect.any(Function),
      handleUploadRetry: expect.any(Function),
    });
  });

  describe('handleUpload', () => {
    it('adds pending image and calls executeUpload with processFile', async () => {
      const mockFile = createMockFile('test-image.jpg', 'image/jpeg');
      const galleryFile = createMockGalleryFile<
        import('@/pages/rec-resource-page/types').GalleryImage
      >('image', {
        id: 'temp-img-123',
        name: 'Test Image',
        extension: 'jpg',
        pendingFile: mockFile,
      });
      const onSuccess = vi.fn();

      mockExecuteUpload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useImageUpload(), {
        wrapper: createQueryClientWrapper(),
      });

      await result.current.handleUpload(galleryFile, onSuccess);

      await waitFor(() => {
        expect(mockExecuteUpload).toHaveBeenCalled();
      });

      const executeUploadCall = mockExecuteUpload.mock.calls[0][0];
      expect(executeUploadCall).toMatchObject({
        recResourceId: 'test-rec-resource-id',
        galleryFile,
        tempId: 'temp-img-123',
        uploadMutation: expect.objectContaining({
          mutateAsync: expect.any(Function),
        }),
        updatePendingFile: expect.any(Function),
        removePendingFile: expect.any(Function),
        successMessage: expect.any(Function),
        fileType: 'image',
        onSuccess,
      });

      expect(executeUploadCall.processFile).toBeDefined();
      expect(executeUploadCall.successMessage('Test Image')).toBe(
        'Image "Test Image" uploaded successfully.',
      );
    });

    it('does nothing if validation fails', async () => {
      vi.mocked(validateUploadFile).mockReturnValueOnce(false);
      const galleryFile = createMockGalleryFile('image', {
        name: 'Test Image',
        pendingFile: undefined,
      });

      const { result } = renderHook(() => useImageUpload(), {
        wrapper: createQueryClientWrapper(),
      });

      await result.current.handleUpload(galleryFile as any);

      expect(mockExecuteUpload).not.toHaveBeenCalled();
    });

    it('does nothing when recResource is undefined', async () => {
      vi.mocked(useRecResource).mockReturnValue({
        recResource: null,
        rec_resource_id: undefined,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(validateUploadFile).mockReturnValueOnce(false);

      const galleryFile = createMockGalleryFile('image', {
        name: 'Test Image',
        pendingFile: createMockFile('test.jpg'),
      });

      const { result } = renderHook(() => useImageUpload(), {
        wrapper: createQueryClientWrapper(),
      });

      await result.current.handleUpload(galleryFile as any);

      expect(mockExecuteUpload).not.toHaveBeenCalled();
    });
  });

  describe('handleUploadRetry', () => {
    it('updates pending image and calls executeUpload', async () => {
      const mockFile = createMockFile('test-image.jpg', 'image/jpeg');
      const pendingImage = createMockGalleryFile('image', {
        id: 'pending-123',
        name: 'Test Image',
        pendingFile: mockFile,
      });
      const onSuccess = vi.fn();

      mockExecuteUpload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useImageUpload(), {
        wrapper: createQueryClientWrapper(),
      });

      await result.current.handleUploadRetry(pendingImage as any, onSuccess);

      await waitFor(() => {
        expect(mockExecuteUpload).toHaveBeenCalled();
      });

      const executeUploadCall = mockExecuteUpload.mock.calls[0][0];
      expect(executeUploadCall).toMatchObject({
        recResourceId: 'test-rec-resource-id',
        galleryFile: pendingImage,
        tempId: 'pending-123',
        fileType: 'image',
        onSuccess,
      });
    });

    it('does nothing if validation fails', async () => {
      vi.mocked(validateUploadFile).mockReturnValueOnce(false);
      const pendingImage = createMockGalleryFile('image', {
        id: 'pending-123',
        name: 'Test Image',
        pendingFile: undefined,
      });

      const { result } = renderHook(() => useImageUpload(), {
        wrapper: createQueryClientWrapper(),
      });

      await result.current.handleUploadRetry(pendingImage as any);

      expect(mockExecuteUpload).not.toHaveBeenCalled();
    });
  });
});
