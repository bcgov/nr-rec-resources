import {
  useCompleteImageS3Upload,
  useGetImageS3UploadUrl,
} from "@/services/hooks/recreation-resource-admin";
import { useUploadResourceImage } from "@/services/hooks/recreation-resource-admin/useUploadResourceImage";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import {
  addPendingImage,
  removePendingImage,
  updatePendingImage,
} from "../store/recResourceFileTransferStore";
import { GalleryFile, GalleryImage } from "../types";
import {
  PresignedUploadConfig,
  PresignedUploadMutations,
  SmartUploadConfig,
  SmartUploadMutations,
  UploadCallbacks,
  usePresignedUploadStrategy,
  useSmartUploadStrategy,
} from "./useUploadStrategies";

// ==================== IMAGE PRESIGNED UPLOAD ====================

/**
 * Hook for direct S3 image uploads using presigned URLs
 * This bypasses the API Gateway 10MB limit completely
 */
export function useImagePresignedUpload() {
  const getPresignedUrlMutation = useGetImageS3UploadUrl();
  const completeUploadMutation = useCompleteImageS3Upload();

  const mutations: PresignedUploadMutations = {
    getPresignedUrl: getPresignedUrlMutation,
    completeUpload: completeUploadMutation,
  };

  const callbacks: UploadCallbacks = {
    addPending: addPendingImage,
    removePending: removePendingImage,
    updatePending: updatePendingImage,
    createPendingItem: (galleryFile: GalleryFile): GalleryImage => ({
      ...galleryFile,
      variants: [],
      previewUrl: "",
      type: "image",
      isUploading: true,
      pendingFile: galleryFile.pendingFile!,
    }),
    onSuccess: (fileTitle: string) => {
      addSuccessNotification(`Image "${fileTitle}" uploaded successfully.`);
    },
    onError: (
      fileTitle: string,
      errorInfo?: { statusCode?: number; message?: string },
    ) => {
      if (errorInfo) {
        addErrorNotification(
          `${errorInfo.statusCode || ""} - Failed to upload image "${fileTitle}": ${errorInfo.message || "Unknown error"}. Please try again.`,
        );
      } else {
        addErrorNotification(
          `Failed to upload image "${fileTitle}". Please try again.`,
        );
      }
    },
  };

  const config: PresignedUploadConfig = {
    defaultContentType: "image/jpeg",
    fileTypeLabel: "image",
    managementSystemLabel: "image management system",
  };

  return usePresignedUploadStrategy(mutations, callbacks, config);
}

// ==================== IMAGE SMART UPLOAD ====================

/**
 * Enhanced image upload hook that automatically chooses the best upload method:
 * - Small files (< 9MB): Use existing API Gateway upload
 * - Large files (≥ 9MB): Use presigned S3 upload to bypass 10MB limit
 */
export function useImageSmartUpload() {
  const uploadResourceImageMutation = useUploadResourceImage();
  const presignedUpload = useImagePresignedUpload();

  const mutations: SmartUploadMutations = {
    uploadMutation: uploadResourceImageMutation,
  };

  const callbacks: UploadCallbacks = {
    addPending: addPendingImage,
    removePending: removePendingImage,
    updatePending: updatePendingImage,
    createPendingItem: (galleryFile: GalleryFile): GalleryImage => ({
      ...galleryFile,
      variants: [],
      previewUrl: "",
      type: "image",
      isUploading: true,
      pendingFile: galleryFile.pendingFile!,
    }),
    onSuccess: (fileTitle: string) => {
      addSuccessNotification(`Image "${fileTitle}" uploaded successfully.`);
    },
    onError: (
      fileTitle: string,
      errorInfo?: { statusCode?: number; message?: string },
    ) => {
      if (errorInfo) {
        addErrorNotification(
          `${errorInfo.statusCode || ""} - Failed to upload image "${fileTitle}": ${errorInfo.message || "Unknown error"}. Please try again.`,
        );
      } else {
        addErrorNotification(
          `Failed to upload image "${fileTitle}". Please try again.`,
        );
      }
    },
  };

  const config: SmartUploadConfig = {
    fileTypeLabel: "image",
    uploadParamBuilder: (
      recResourceId: string,
      file: File,
      caption: string,
    ) => ({
      recResourceId,
      file,
      caption,
    }),
  };

  return useSmartUploadStrategy(mutations, callbacks, presignedUpload, config);
}
