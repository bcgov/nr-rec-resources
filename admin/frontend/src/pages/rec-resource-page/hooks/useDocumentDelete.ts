import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useDeleteResourceDocument } from '@/services/hooks/recreation-resource-admin/useDeleteResourceDocument';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';
import {
  recResourceFileTransferStore,
  setFileToDelete,
  updateGalleryDocument,
} from '../store/recResourceFileTransferStore';

/**
 * Hook to manage document delete operations.
 * Handles deletion of documents with proper error handling and notifications.
 */
export function useDocumentDelete() {
  const { recResource } = useRecResource();
  const { fileToDelete } = useStore(recResourceFileTransferStore);
  const deleteResourceDocumentMutation = useDeleteResourceDocument();

  // Handle document deletion
  const handleDelete = useCallback(
    async (onSuccess?: () => void) => {
      const document = fileToDelete;
      if (
        !recResource?.rec_resource_id ||
        !document?.id ||
        document.type !== 'document'
      ) {
        addErrorNotification(
          'Unable to delete document: missing required information.',
        );
        return;
      }

      try {
        updateGalleryDocument(document.id, { isDeleting: true });
        await deleteResourceDocumentMutation.mutateAsync({
          recResourceId: recResource.rec_resource_id,
          refId: document.id,
        });
        addSuccessNotification(
          `Document "${document.name}" deleted successfully.`,
        );
        setFileToDelete(undefined); // Clear the file to delete
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);

        addErrorNotification(
          `${errorInfo.statusCode} - Failed to delete document "${document.name}": ${errorInfo.message}. Please try again.`,
        );
        updateGalleryDocument(document.id, {
          isDeleting: false,
          deleteFailed: true,
        });
      }
    },
    [
      deleteResourceDocumentMutation,
      recResource?.rec_resource_id,
      fileToDelete,
    ],
  );

  return {
    handleDelete,
    isDeleting: deleteResourceDocumentMutation.isPending,
  };
}
