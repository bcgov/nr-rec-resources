import { useDocumentDelete } from '@/pages/rec-resource-page/hooks/useDocumentDelete';
import { useFileDelete } from '@/pages/rec-resource-page/hooks/utils/useFileDelete';
import * as store from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryDocument } from '@/pages/rec-resource-page/types';
import { useDeleteResourceDocument } from '@/services/hooks/recreation-resource-admin/useDeleteResourceDocument';
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
  '@/services/hooks/recreation-resource-admin/useDeleteResourceDocument',
  () => ({
    useDeleteResourceDocument: vi.fn(),
  }),
);

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  recResourceFileTransferStore: {
    setState: vi.fn(),
    getState: vi.fn(),
    state: { galleryDocuments: [], fileToDelete: null },
  },
  updateGalleryDocument: vi.fn(),
  setFileToDelete: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/useFileDelete', () => ({
  useFileDelete: vi.fn(),
}));

const mockDeleteMutation = vi.fn();
const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
  id: 'test-doc-123',
  name: 'test-document.pdf',
  url: 'http://example.com/test.pdf',
  extension: 'pdf',
});

describe('useDocumentDelete', () => {
  const mockExecuteDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    setupDeleteMocks({
      recResourceId: 'test-resource-123',
    });

    vi.mocked(useStore).mockReturnValue({ fileToDelete: mockDocument });

    vi.mocked(useDeleteResourceDocument).mockReturnValue({
      mutateAsync: mockDeleteMutation,
      isPending: false,
    } as any);

    vi.mocked(useFileDelete).mockReturnValue({
      executeDelete: mockExecuteDelete,
    } as any);
  });

  it('returns delete handlers and pending state', () => {
    const { result } = renderHook(() => useDocumentDelete());

    expect(result.current).toMatchObject({
      handleDelete: expect.any(Function),
      isDeleting: expect.any(Boolean),
    });
  });

  describe('handleDelete', () => {
    it('calls executeDelete with correct parameters', async () => {
      const onSuccess = vi.fn();
      mockExecuteDelete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      const callArgs = mockExecuteDelete.mock.calls[0][0];
      expect(callArgs).toMatchObject({
        recResourceId: 'test-resource-123',
        file: mockDocument,
        expectedType: 'document',
        deleteMutation: expect.objectContaining({
          mutateAsync: mockDeleteMutation,
        }),
        updateGalleryFile: store.updateGalleryDocument,
        setFileToDelete: store.setFileToDelete,
        errorMessage:
          'Unable to delete document: missing required information.',
        onSuccess,
      });

      // Verify getMutationParams function
      expect(callArgs.getMutationParams).toBeDefined();
      expect(
        callArgs.getMutationParams('test-resource-123', 'test-doc-123'),
      ).toEqual({
        recResourceId: 'test-resource-123',
        documentId: 'test-doc-123',
      });

      // Verify successMessage function
      expect(callArgs.successMessage).toBeDefined();
      expect(callArgs.successMessage('test-document.pdf')).toBe(
        'Document "test-document.pdf" deleted successfully.',
      );
    });

    it('works without onSuccess callback', async () => {
      mockExecuteDelete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDocumentDelete());

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
      const documentFromStore = createMockGalleryFile<GalleryDocument>(
        'document',
        {
          id: 'store-doc-456',
          name: 'store-document.pdf',
        },
      );
      vi.mocked(useStore).mockReturnValue({ fileToDelete: documentFromStore });

      mockExecuteDelete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockExecuteDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          file: documentFromStore,
        }),
      );
    });
  });

  describe('isDeleting state', () => {
    it('returns isPending state from mutation', () => {
      vi.mocked(useDeleteResourceDocument).mockReturnValue({
        mutateAsync: mockDeleteMutation,
        isPending: true,
      } as any);

      const { result } = renderHook(() => useDocumentDelete());

      expect(result.current.isDeleting).toBe(true);
    });

    it('returns false when mutation is not pending', () => {
      vi.mocked(useDeleteResourceDocument).mockReturnValue({
        mutateAsync: mockDeleteMutation,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useDocumentDelete());

      expect(result.current.isDeleting).toBe(false);
    });
  });
});
