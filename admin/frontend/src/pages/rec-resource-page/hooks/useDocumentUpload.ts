import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { useUploadResourceDocument } from "@/services/recreation-resource-admin";
import { handleApiError } from "@/services/utils/errorHandler";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { useCallback } from "react";
import {
  addPendingDoc,
  removePendingDoc,
  updatePendingDoc,
} from "../store/recResourceFileTransferStore";
import { GalleryDocument, GalleryFile } from "../types";

/**
 * Hook to manage document upload operations.
 * Handles both new uploads and retry operations for failed uploads.
 */
export function useDocumentUpload() {
  const { recResource } = useRecResource();
  const uploadResourceDocumentMutation = useUploadResourceDocument();

  // Shared upload logic for both new and retry uploads
  const doUpload = useCallback(
    async ({
      rec_resource_id,
      file,
      title,
      tempId,
      onSuccess,
    }: {
      rec_resource_id: string;
      file: File;
      title: string;
      tempId: string;
      onSuccess?: () => void;
    }) => {
      try {
        await uploadResourceDocumentMutation.mutateAsync({
          recResourceId: rec_resource_id,
          file,
          title,
        });
        addSuccessNotification(`File "${title}" uploaded successfully.`);
        removePendingDoc(tempId);
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);
        addErrorNotification(
          `${errorInfo.statusCode} - Failed to upload file "${title}": ${errorInfo.message}. Please try again.`,
        );
        updatePendingDoc(tempId, {
          isUploading: false,
          uploadFailed: true,
        });
      }
    },
    [uploadResourceDocumentMutation],
  );

  // Handle upload (with pending doc)
  const handleUpload = useCallback(
    async (galleryFile: GalleryFile, onSuccess?: () => void) => {
      if (
        !recResource?.rec_resource_id ||
        !galleryFile.pendingFile ||
        !galleryFile.name
      ) {
        return;
      }
      const tempDoc: GalleryDocument = {
        ...galleryFile,
        isUploading: true,
        pendingFile: galleryFile.pendingFile,
        type: "document",
      };
      addPendingDoc(tempDoc);

      await doUpload({
        rec_resource_id: recResource.rec_resource_id,
        file: galleryFile.pendingFile,
        title: galleryFile.name,
        tempId: galleryFile.id,
        onSuccess,
      });
    },
    [doUpload, recResource],
  );

  // Handle upload retry (for failed uploads)
  const handleUploadRetry = useCallback(
    async (pendingDoc: GalleryFile, onSuccess?: () => void) => {
      if (!recResource?.rec_resource_id || !pendingDoc.pendingFile) {
        return;
      }
      updatePendingDoc(pendingDoc.id, {
        isUploading: true,
        uploadFailed: false,
      });
      await doUpload({
        rec_resource_id: recResource.rec_resource_id,
        file: pendingDoc.pendingFile,
        title: pendingDoc.name,
        tempId: pendingDoc.id,
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
