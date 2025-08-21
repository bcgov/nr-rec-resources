import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { useDeleteResourceImage } from "@/services/recreation-resource-admin";
import { handleApiError } from "@/services/utils/errorHandler";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import {
  recResourceFileTransferStore,
  setFileToDelete,
  updateGalleryImage,
} from "../store/recResourceFileTransferStore";

/**
 * Hook to manage image delete operations.
 * Handles deletion of images with proper error handling and notifications.
 */
export function useImageDelete() {
  const { recResource } = useRecResource();
  const { fileToDelete } = useStore(recResourceFileTransferStore);
  const deleteResourceImageMutation = useDeleteResourceImage();

  // Handle image deletion
  const handleDelete = useCallback(
    async (onSuccess?: () => void) => {
      const image = fileToDelete;
      if (
        !recResource?.rec_resource_id ||
        !image?.id ||
        image.type !== "image"
      ) {
        addErrorNotification(
          "Unable to delete image: missing required information.",
        );
        return;
      }

      try {
        updateGalleryImage(image.id, { isDeleting: true });
        await deleteResourceImageMutation.mutateAsync({
          recResourceId: recResource.rec_resource_id,
          refId: image.id,
        });
        addSuccessNotification(`Image "${image.name}" deleted successfully.`);
        setFileToDelete(undefined); // Clear the file to delete
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);

        addErrorNotification(
          `${errorInfo.statusCode} - Failed to delete image "${image.name}": ${errorInfo.message}. Please try again.`,
        );
        updateGalleryImage(image.id, {
          isDeleting: false,
          deleteFailed: true,
        });
      }
    },
    [deleteResourceImageMutation, recResource?.rec_resource_id, fileToDelete],
  );

  return {
    handleDelete,
    isDeleting: deleteResourceImageMutation.isPending,
  };
}
