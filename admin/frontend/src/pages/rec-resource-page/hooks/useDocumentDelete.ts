import { useDeleteResourceDocument } from "@/services/hooks/recreation-resource-admin/useDeleteResourceDocument";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import { recResourceDetailStore } from "../store/recResourceDetailStore";
import { updateGalleryDocument } from "../store/recResourceFileTransferStore";
import { GalleryDocument } from "../types";

/**
 * Hook to manage document delete operations.
 * Handles deletion of documents with proper error handling and notifications.
 */
export function useDocumentDelete() {
  const { recResource } = useStore(recResourceDetailStore);
  const deleteResourceDocumentMutation = useDeleteResourceDocument();

  // Handle document deletion
  const handleDelete = useCallback(
    async (document: GalleryDocument, onSuccess?: () => void) => {
      if (!recResource?.rec_resource_id || !document.id) {
        addErrorNotification(
          "Unable to delete document: missing required information.",
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
        onSuccess?.();
      } catch {
        addErrorNotification(
          `Failed to delete document "${document.name}". Please try again.`,
        );
      }
    },
    [deleteResourceDocumentMutation, recResource?.rec_resource_id],
  );

  return {
    handleDelete,
    isDeleting: deleteResourceDocumentMutation.isPending,
  };
}
