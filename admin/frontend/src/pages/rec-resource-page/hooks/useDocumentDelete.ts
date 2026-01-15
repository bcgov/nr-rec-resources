import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useDeleteResourceDocument } from '@/services/hooks/recreation-resource-admin/useDeleteResourceDocument';
import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';
import {
  recResourceFileTransferStore,
  setFileToDelete,
  updateGalleryDocument,
} from '../store/recResourceFileTransferStore';
import { GalleryDocument } from '../types';
import { useFileDelete } from './utils/useFileDelete';

export function useDocumentDelete() {
  const { recResource } = useRecResource();
  const { fileToDelete } = useStore(recResourceFileTransferStore);
  const deleteResourceDocumentMutation = useDeleteResourceDocument();
  const { executeDelete } = useFileDelete<GalleryDocument>();

  const handleDelete = useCallback(
    async (onSuccess?: () => void) => {
      await executeDelete({
        recResourceId: recResource?.rec_resource_id,
        file: fileToDelete,
        expectedType: 'document',
        deleteMutation: deleteResourceDocumentMutation,
        updateGalleryFile: updateGalleryDocument,
        setFileToDelete,
        getMutationParams: (recResourceId, fileId) => ({
          recResourceId,
          documentId: fileId,
        }),
        successMessage: (fileName) =>
          `Document "${fileName}" deleted successfully.`,
        errorMessage:
          'Unable to delete document: missing required information.',
        onSuccess,
      });
    },
    [executeDelete, deleteResourceDocumentMutation, recResource, fileToDelete],
  );

  return {
    handleDelete,
    isDeleting: deleteResourceDocumentMutation.isPending,
  };
}
