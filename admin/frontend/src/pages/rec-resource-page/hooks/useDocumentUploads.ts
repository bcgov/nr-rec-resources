import {
  useCompleteDocumentS3Upload,
  useGetDocumentS3UploadUrl,
  useUploadResourceDocument,
} from "@/services/hooks/recreation-resource-admin";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import {
  addPendingDoc,
  removePendingDoc,
  updatePendingDoc,
} from "../store/recResourceFileTransferStore";
import { GalleryDocument, GalleryFile } from "../types";
import {
  PresignedUploadConfig,
  PresignedUploadMutations,
  SmartUploadConfig,
  SmartUploadMutations,
  UploadCallbacks,
  usePresignedUploadStrategy,
  useSmartUploadStrategy,
} from "./useUploadStrategies";

// ==================== DOCUMENT PRESIGNED UPLOAD ====================

/**
 * Hook for direct S3 document uploads using presigned URLs
 * This bypasses the API Gateway 10MB limit completely
 */
export function useDocumentPresignedUpload() {
  const getPresignedUrlMutation = useGetDocumentS3UploadUrl();
  const completeUploadMutation = useCompleteDocumentS3Upload();

  const mutations: PresignedUploadMutations = {
    getPresignedUrl: getPresignedUrlMutation,
    completeUpload: completeUploadMutation,
  };

  const callbacks: UploadCallbacks = {
    addPending: addPendingDoc,
    removePending: removePendingDoc,
    updatePending: updatePendingDoc,
    createPendingItem: (galleryFile: GalleryFile): GalleryDocument => ({
      ...galleryFile,
      isUploading: true,
      pendingFile: galleryFile.pendingFile!,
      type: "document",
    }),
    onSuccess: (fileTitle: string) => {
      addSuccessNotification(`File "${fileTitle}" uploaded successfully.`);
    },
    onError: (
      fileTitle: string,
      errorInfo?: { statusCode?: number; message?: string },
    ) => {
      if (errorInfo) {
        addErrorNotification(
          `${errorInfo.statusCode || ""} - Failed to upload file "${fileTitle}": ${errorInfo.message || "Unknown error"}. Please try again.`,
        );
      } else {
        addErrorNotification(
          `Failed to upload file "${fileTitle}". Please try again.`,
        );
      }
    },
  };

  const config: PresignedUploadConfig = {
    defaultContentType: "application/pdf",
    fileTypeLabel: "document",
    managementSystemLabel: "document management system",
  };

  return usePresignedUploadStrategy(mutations, callbacks, config);
}

// ==================== DOCUMENT SMART UPLOAD ====================

/**
 * Enhanced document upload hook that automatically chooses the best upload method:
 * - Small files (< 9MB): Use existing API Gateway upload
 * - Large files (≥ 9MB): Use presigned S3 upload to bypass 10MB limit
 */
export function useDocumentSmartUpload() {
  const uploadResourceDocumentMutation = useUploadResourceDocument();
  const presignedUpload = useDocumentPresignedUpload();

  const mutations: SmartUploadMutations = {
    uploadMutation: uploadResourceDocumentMutation,
  };

  const callbacks: UploadCallbacks = {
    addPending: addPendingDoc,
    removePending: removePendingDoc,
    updatePending: updatePendingDoc,
    createPendingItem: (galleryFile: GalleryFile): GalleryDocument => ({
      ...galleryFile,
      isUploading: true,
      pendingFile: galleryFile.pendingFile!,
      type: "document",
    }),
    onSuccess: (fileTitle: string) => {
      addSuccessNotification(`File "${fileTitle}" uploaded successfully.`);
    },
    onError: (
      fileTitle: string,
      errorInfo?: { statusCode?: number; message?: string },
    ) => {
      if (errorInfo) {
        addErrorNotification(
          `${errorInfo.statusCode || ""} - Failed to upload file "${fileTitle}": ${errorInfo.message || "Unknown error"}. Please try again.`,
        );
      } else {
        addErrorNotification(
          `Failed to upload file "${fileTitle}". Please try again.`,
        );
      }
    },
  };

  const config: SmartUploadConfig = {
    fileTypeLabel: "file",
    uploadParamBuilder: (recResourceId: string, file: File, title: string) => ({
      recResourceId,
      file,
      title,
    }),
  };

  return useSmartUploadStrategy(mutations, callbacks, presignedUpload, config);
}
