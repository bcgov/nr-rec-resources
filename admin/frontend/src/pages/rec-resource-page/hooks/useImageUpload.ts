import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { useUploadResourceImage } from "@/services/recreation-resource-admin";
import { handleApiError } from "@/services/utils/errorHandler";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { useCallback } from "react";
import {
  addPendingImage,
  removePendingImage,
  updatePendingImage,
} from "../store/recResourceFileTransferStore";
import { GalleryFile, GalleryImage } from "../types";

/**
 * Hook to manage image upload operations.
 * Handles both new uploads and retry operations for failed uploads.
 */
export function useImageUpload() {
  const { recResource } = useRecResource();
  const uploadResourceImageMutation = useUploadResourceImage();

  // Shared upload logic for both new and retry uploads
  const doUpload = useCallback(
    async ({
      rec_resource_id,
      file,
      caption,
      tempId,
      onSuccess,
    }: {
      rec_resource_id: string;
      file: File;
      caption: string;
      tempId: string;
      onSuccess?: () => void;
    }) => {
      try {
        await uploadResourceImageMutation.mutateAsync({
          recResourceId: rec_resource_id,
          file,
          caption,
        });
        addSuccessNotification(`Image "${caption}" uploaded successfully.`);
        removePendingImage(tempId);
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);
        addErrorNotification(
          `${errorInfo.statusCode} - Failed to upload image "${caption}": ${errorInfo.message}. Please try again.`,
        );
        updatePendingImage(tempId, {
          isUploading: false,
          uploadFailed: true,
        });
      }
    },
    [uploadResourceImageMutation],
  );

  // Handle upload (with pending image)
  const handleUpload = useCallback(
    async (galleryFile: GalleryFile, onSuccess?: () => void) => {
      if (
        !recResource?.rec_resource_id ||
        !galleryFile.pendingFile ||
        !galleryFile.name
      ) {
        return;
      }
      const tempImage: GalleryImage = {
        ...galleryFile,
        variants: [],
        previewUrl: "",
        type: "image",
        isUploading: true,
      };
      addPendingImage(tempImage);

      await doUpload({
        rec_resource_id: recResource.rec_resource_id,
        file: galleryFile.pendingFile,
        caption: galleryFile.name,
        tempId: galleryFile.id,
        onSuccess,
      });
    },
    [doUpload, recResource],
  );

  // Handle upload retry (for failed uploads)
  const handleUploadRetry = useCallback(
    async (pendingImage: GalleryFile, onSuccess?: () => void) => {
      if (!recResource?.rec_resource_id || !pendingImage.pendingFile) {
        return;
      }
      updatePendingImage(pendingImage.id, {
        isUploading: true,
        uploadFailed: false,
      });
      await doUpload({
        rec_resource_id: recResource.rec_resource_id,
        file: pendingImage.pendingFile,
        caption: pendingImage.name,
        tempId: pendingImage.id,
        onSuccess,
      });
    },
    [doUpload, recResource],
  );

  return {
    handleUpload,
    handleUploadRetry,
  };
}
