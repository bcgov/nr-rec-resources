import { useImageUpload } from '@/pages/rec-resource-page/hooks/useImageUpload';
import { processImageToVariants } from '@/utils/imageProcessing';
import { renderHook } from '@testing-library/react';
import { TestQueryClientProvider } from '@test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFile,
  createMockGalleryFile,
  createMockImageVariants,
} from './test-utils/upload-delete-test-utils';

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: vi.fn(),
}));

vi.mock('@/utils/imageProcessing', () => ({
  processImageToVariants: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  addPendingImage: vi.fn(),
  removePendingImage: vi.fn(),
  updatePendingImage: vi.fn(),
  recResourceFileTransferStore: {
    state: {
      uploadConsentMetadata: {
        dateTaken: null,
        containsPii: false,
        photographerType: 'STAFF',
        photographerName: '',
        consentFormFile: null,
      },
    },
    subscribe: vi.fn(),
  },
}));

// Mock useStore to return consent metadata
vi.mock('@tanstack/react-store', () => ({
  useStore: vi.fn(() => ({
    uploadConsentMetadata: {
      dateTaken: null,
      containsPii: false,
      photographerType: 'STAFF',
      photographerName: '',
      consentFormFile: null,
    },
  })),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/validateUpload', () => ({
  validateUploadFile: vi.fn(),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/usePresignAndFinalizeHooks',
  () => ({
    usePresignImageUpload: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useFinalizeImageUpload: vi.fn(() => ({ mutateAsync: vi.fn() })),
  }),
);

vi.mock('@/pages/rec-resource-page/hooks/utils/usePresignedUpload', () => ({
  usePresignedUpload: vi.fn(),
}));

import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { validateUploadFile } from '@/pages/rec-resource-page/hooks/utils/validateUpload';
import { usePresignedUpload } from '@/pages/rec-resource-page/hooks/utils/usePresignedUpload';

const mockExecutePresignedUpload = vi.fn();
const mockRecResource = {
  recResource: { rec_resource_id: 'test-rec-resource-id' },
  rec_resource_id: 'test-rec-resource-id',
  isLoading: false,
  error: null,
};

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRecResource).mockReturnValue(mockRecResource as any);
    vi.mocked(validateUploadFile).mockReturnValue(true);
    vi.mocked(processImageToVariants).mockResolvedValue(
      createMockImageVariants(),
    );
    vi.mocked(usePresignedUpload).mockReturnValue({
      executePresignedUpload: mockExecutePresignedUpload,
    } as any);
  });

  it('returns upload handlers', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current).toMatchObject({
      handleUpload: expect.any(Function),
      handleUploadRetry: expect.any(Function),
    });
  });

  describe('handleUpload', () => {
    it('adds pending image and calls executePresignedUpload with processFile', async () => {
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

      mockExecutePresignedUpload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useImageUpload());

      await result.current.handleUpload(galleryFile, onSuccess);

      expect(mockExecutePresignedUpload).toHaveBeenCalled();
      const call = mockExecutePresignedUpload.mock.calls[0][0];
      expect(call).toMatchObject({
        recResourceId: 'test-rec-resource-id',
        galleryFile: expect.objectContaining({
          name: 'Test Image',
          type: 'image',
        }),
        tempId: 'temp-img-123',
        presignMutation: expect.any(Object),
        finalizeMutation: expect.any(Object),
        processFile: expect.any(Function),
        updatePendingFile: expect.any(Function),
        removePendingFile: expect.any(Function),
        successMessage: expect.any(Function),
        fileType: 'image',
        onSuccess,
      });

      expect(call.processFile).toBeDefined();
      expect(call.successMessage('Test Image')).toBe(
        'Image "Test Image" uploaded successfully.',
      );
    });

    it('processFile calls processImageToVariants and includes consent metadata', async () => {
      const mockFile = createMockFile('test-image.jpg', 'image/jpeg');
      const galleryFile = createMockGalleryFile<
        import('@/pages/rec-resource-page/types').GalleryImage
      >('image', {
        id: 'temp-img-123',
        name: 'Test Image',
        pendingFile: mockFile,
      });

      const mockVariants = createMockImageVariants();
      vi.mocked(processImageToVariants).mockResolvedValue(mockVariants);

      const { result } = renderHook(() => useImageUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.handleUpload(galleryFile);

      const executeUploadCall = mockExecutePresignedUpload.mock.calls[0][0];
      const processFileResult = await executeUploadCall.processFile(mockFile);

      expect(processImageToVariants).toHaveBeenCalledWith({
        file: mockFile,
        onProgress: undefined,
      });

      expect(processFileResult).toMatchObject({
        variants: mockVariants,
        dateTaken: null,
        containsPii: false,
        photographerType: 'STAFF',
        photographerName: '',
      });
    });

    it('does nothing if validation fails', async () => {
      vi.mocked(validateUploadFile).mockReturnValueOnce(false);
      const galleryFile = createMockGalleryFile('image', {
        name: 'Test Image',
        pendingFile: undefined,
      });

      const { result } = renderHook(() => useImageUpload());

      await result.current.handleUpload(galleryFile as any);

      expect(mockExecutePresignedUpload).not.toHaveBeenCalled();
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

      const { result } = renderHook(() => useImageUpload());

      await result.current.handleUpload(galleryFile as any);

      expect(mockExecutePresignedUpload).not.toHaveBeenCalled();
    });
  });

  describe('handleUploadRetry', () => {
    it('updates pending image and calls executePresignedUpload', async () => {
      const mockFile = createMockFile('test-image.jpg', 'image/jpeg');
      const pendingImage = createMockGalleryFile('image', {
        id: 'pending-123',
        name: 'Test Image',
        pendingFile: mockFile,
      });
      const onSuccess = vi.fn();

      mockExecutePresignedUpload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useImageUpload());

      await result.current.handleUploadRetry(pendingImage as any, onSuccess);

      expect(mockExecutePresignedUpload).toHaveBeenCalled();
      const call = mockExecutePresignedUpload.mock.calls[0][0];
      expect(call).toMatchObject({
        recResourceId: 'test-rec-resource-id',
        galleryFile: pendingImage,
        tempId: 'pending-123',
        presignMutation: expect.any(Object),
        finalizeMutation: expect.any(Object),
        processFile: expect.any(Function),
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

      const { result } = renderHook(() => useImageUpload());

      await result.current.handleUploadRetry(pendingImage as any);

      expect(mockExecutePresignedUpload).not.toHaveBeenCalled();
    });
  });
});
