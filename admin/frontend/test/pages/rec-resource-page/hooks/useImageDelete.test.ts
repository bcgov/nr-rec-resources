import { useImageDelete } from '@/pages/rec-resource-page/hooks/useImageDelete';
import { useFileDelete } from '@/pages/rec-resource-page/hooks/utils/useFileDelete';
import * as store from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryImage } from '@/pages/rec-resource-page/types';
import { useDeleteResourceImage } from '@/services/hooks/recreation-resource-admin/useDeleteResourceImage';
import { useStore } from '@tanstack/react-store';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockGalleryFile,
  setupDeleteMocks,
} from './test-utils/upload-delete-test-utils';

// Mock dependencies
vi.mock('@tanstack/react-store', () => ({
  useStore: vi.fn(),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useDeleteResourceImage',
  () => ({
    useDeleteResourceImage: vi.fn(),
  }),
);

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  recResourceFileTransferStore: {
    setState: vi.fn(),
    getState: vi.fn(),
    state: { galleryImages: [], fileToDelete: null },
  },
  updateGalleryImage: vi.fn(),
  setFileToDelete: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/useFileDelete', () => ({
  useFileDelete: vi.fn(),
}));

const mockDeleteMutation = vi.fn();
const mockImage = createMockGalleryFile<GalleryImage>('image', {
  id: 'test-image-123',
  name: 'test-image.jpg',
  url: 'http://example.com/test.jpg',
  extension: 'jpg',
  variants: [],
  previewUrl: 'http://example.com/preview.jpg',
});

describe('useImageDelete', () => {
  const mockExecuteDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    setupDeleteMocks({
      recResourceId: 'test-resource-123',
    });

    vi.mocked(useStore).mockReturnValue({ fileToDelete: mockImage });

    vi.mocked(useDeleteResourceImage).mockReturnValue({
      mutateAsync: mockDeleteMutation,
      isPending: false,
    } as any);

    vi.mocked(useFileDelete).mockReturnValue({
      executeDelete: mockExecuteDelete,
    } as any);
  });

  it('returns delete handlers and pending state', () => {
    const { result } = renderHook(() => useImageDelete());

    expect(result.current).toMatchObject({
      handleDelete: expect.any(Function),
      isDeleting: expect.any(Boolean),
    });
  });

  describe('handleDelete', () => {
    it('calls executeDelete with correct parameters', async () => {
      const onSuccess = vi.fn();
      mockExecuteDelete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useImageDelete());

      await act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      const callArgs = mockExecuteDelete.mock.calls[0][0];
      expect(callArgs).toMatchObject({
        recResourceId: 'test-resource-123',
        file: mockImage,
        expectedType: 'image',
        deleteMutation: expect.objectContaining({
          mutateAsync: mockDeleteMutation,
        }),
        updateGalleryFile: store.updateGalleryImage,
        setFileToDelete: store.setFileToDelete,
        errorMessage: 'Unable to delete image: missing required information.',
        onSuccess,
      });

      // Verify getMutationParams function
      expect(callArgs.getMutationParams).toBeDefined();
      expect(
        callArgs.getMutationParams('test-resource-123', 'test-image-123'),
      ).toEqual({
        recResourceId: 'test-resource-123',
        imageId: 'test-image-123',
      });

      // Verify successMessage function
      expect(callArgs.successMessage).toBeDefined();
      expect(callArgs.successMessage('test-image.jpg')).toBe(
        'Image "test-image.jpg" deleted successfully.',
      );
    });

    it('works without onSuccess callback', async () => {
      mockExecuteDelete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useImageDelete());

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockExecuteDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: undefined,
        }),
      );
    });

    it('passes fileToDelete from store to executeDelete', async () => {
      const imageFromStore = createMockGalleryFile<GalleryImage>('image', {
        id: 'store-image-456',
        name: 'store-image.jpg',
      });
      vi.mocked(useStore).mockReturnValue({ fileToDelete: imageFromStore });

      mockExecuteDelete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useImageDelete());

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockExecuteDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          file: imageFromStore,
        }),
      );
    });
  });

  describe('isDeleting state', () => {
    it('returns isPending state from mutation', () => {
      vi.mocked(useDeleteResourceImage).mockReturnValue({
        mutateAsync: mockDeleteMutation,
        isPending: true,
      } as any);

      const { result } = renderHook(() => useImageDelete());

      expect(result.current.isDeleting).toBe(true);
    });

    it('returns false when mutation is not pending', () => {
      vi.mocked(useDeleteResourceImage).mockReturnValue({
        mutateAsync: mockDeleteMutation,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useImageDelete());

      expect(result.current.isDeleting).toBe(false);
    });
  });
});
