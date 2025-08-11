import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { PresignedUploadResponseDto } from "@/services/recreation-resource-admin";
import { handleApiError } from "@/services/utils/errorHandler";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { useCallback, useState } from "react";
import { GalleryFile } from "../types";

// ==================== SHARED INTERFACES ====================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface PresignedUploadMutations {
  getPresignedUrl: {
    mutateAsync: (params: {
      recResourceId: string;
      fileName: string;
      fileSize: number;
      contentType?: string;
    }) => Promise<PresignedUploadResponseDto>;
  };
  completeUpload: {
    mutateAsync: (params: {
      recResourceId: string;
      uploadId: string;
      title: string;
      originalFileName: string;
      fileSize: number;
    }) => Promise<{ ref_id: string }>;
  };
}

export interface SmartUploadMutations {
  uploadMutation: {
    mutateAsync: (params: any) => Promise<any>;
  };
}

export interface UploadCallbacks {
  addPending: (item: any) => void;
  removePending: (id: string) => void;
  updatePending: (id: string, updates: any) => void;
  createPendingItem: (galleryFile: GalleryFile) => any;
  onSuccess?: (fileTitle: string) => void;
  onError?: (
    fileTitle: string,
    errorInfo?: { statusCode?: number; message?: string },
  ) => void;
}

export interface PresignedUploadConfig {
  defaultContentType: string;
  fileTypeLabel: string; // "document" or "image"
  managementSystemLabel: string; // "document management system" or "image management system"
}

export interface SmartUploadConfig {
  fileTypeLabel: string; // "document" or "image"
  uploadParamBuilder: (
    rec_resource_id: string,
    file: File,
    name: string,
  ) => any;
}

export interface PresignedUploadHook {
  handlePresignedUpload: (
    galleryFile: GalleryFile,
    onSuccess?: () => void,
  ) => Promise<void>;
  canUsePresignedUpload: (file: File) => boolean;
}

// ==================== PRESIGNED UPLOAD STRATEGY ====================

/**
 * Generic hook for direct S3 uploads using presigned URLs
 * This bypasses the API Gateway 10MB limit completely
 *
 * @param mutations - The specific mutation hooks for getting presigned URL and completing upload
 * @param callbacks - The specific callbacks for managing pending items
 * @param config - Configuration for file type specific behavior
 */
export function usePresignedUploadStrategy(
  mutations: PresignedUploadMutations,
  callbacks: UploadCallbacks,
  config: PresignedUploadConfig,
) {
  const { recResource } = useRecResource();
  const [uploadStates, setUploadStates] = useState<
    Record<string, { isUploading: boolean; progress?: UploadProgress }>
  >({});

  /**
   * Step 1: Get presigned URL from your backend using the SDK
   */
  const getPresignedUrl = useCallback(
    async (
      recResourceId: string,
      fileName: string,
      fileSize: number,
      contentType: string = config.defaultContentType,
    ): Promise<PresignedUploadResponseDto> => {
      const result = await mutations.getPresignedUrl.mutateAsync({
        recResourceId,
        fileName,
        fileSize,
        contentType,
      });
      return result;
    },
    [mutations.getPresignedUrl, config.defaultContentType],
  );

  /**
   * Step 2: Upload directly to S3 using presigned URL
   */
  const uploadToS3 = useCallback(
    async (
      file: File,
      presignedData: PresignedUploadResponseDto,
      onProgress?: (progress: UploadProgress) => void,
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("S3 upload failed"));
        });

        xhr.open("PUT", presignedData.uploadUrl);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || config.defaultContentType,
        );
        xhr.send(file);
      });
    },
    [config.defaultContentType],
  );

  /**
   * Step 3: Complete the upload on your backend
   */
  const completeUpload = useCallback(
    async (
      recResourceId: string,
      uploadId: string,
      title: string,
      originalFileName: string,
      fileSize: number,
    ) => {
      const result = await mutations.completeUpload.mutateAsync({
        recResourceId,
        uploadId,
        title,
        originalFileName,
        fileSize,
      });
      return result;
    },
    [mutations.completeUpload],
  );

  /**
   * Check if a file can use presigned upload (file type and size validation)
   */
  const canUsePresignedUpload = useCallback((file: File): boolean => {
    const maxSize = 100 * 1024 * 1024; // 100MB limit for presigned uploads
    return file.size <= maxSize;
  }, []);

  /**
   * Full presigned upload flow
   */
  const handlePresignedUpload = useCallback(
    async (galleryFile: GalleryFile, onSuccess?: () => void) => {
      if (
        !recResource?.rec_resource_id ||
        !galleryFile.pendingFile ||
        !galleryFile.name
      ) {
        return;
      }

      const file = galleryFile.pendingFile;
      const fileSizeMB = file.size / 1024 / 1024;

      if (!canUsePresignedUpload(file)) {
        addErrorNotification(
          `${config.fileTypeLabel} "${galleryFile.name}" (${fileSizeMB.toFixed(1)}MB) is too large. Maximum supported size is 100MB.`,
        );
        return;
      }

      // Create and add pending item
      const pendingItem = callbacks.createPendingItem(galleryFile);
      callbacks.addPending(pendingItem);

      // Set initial upload state
      setUploadStates((prev) => ({
        ...prev,
        [galleryFile.id]: { isUploading: true },
      }));

      try {
        // Step 1: Get presigned URL
        const presignedData = await getPresignedUrl(
          recResource.rec_resource_id,
          file.name,
          file.size,
          file.type || config.defaultContentType,
        );

        // Step 2: Upload to S3 with progress tracking
        await uploadToS3(file, presignedData, (progress) => {
          setUploadStates((prev) => ({
            ...prev,
            [galleryFile.id]: { isUploading: true, progress },
          }));
          callbacks.updatePending(galleryFile.id, {
            isUploading: true,
            uploadProgress: progress.percentage,
          });
        });

        // Step 3: Complete upload on backend
        await completeUpload(
          recResource.rec_resource_id,
          presignedData.uploadId,
          galleryFile.name,
          file.name,
          file.size,
        );

        // Success
        addSuccessNotification(
          `${config.fileTypeLabel} "${galleryFile.name}" uploaded successfully using direct cloud upload.`,
        );
        callbacks.removePending(galleryFile.id);
        setUploadStates((prev) => {
          const newState = { ...prev };
          delete newState[galleryFile.id];
          return newState;
        });
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);
        addErrorNotification(
          `${errorInfo.statusCode} - Failed to upload ${config.fileTypeLabel} "${galleryFile.name}" to ${config.managementSystemLabel}: ${errorInfo.message}. Please try again.`,
        );
        callbacks.updatePending(galleryFile.id, {
          isUploading: false,
          uploadFailed: true,
        });
        setUploadStates((prev) => {
          const newState = { ...prev };
          delete newState[galleryFile.id];
          return newState;
        });
      }
    },
    [
      recResource,
      canUsePresignedUpload,
      callbacks,
      config,
      getPresignedUrl,
      uploadToS3,
      completeUpload,
    ],
  );

  const getUploadState = useCallback(
    (fileId: string) => uploadStates[fileId],
    [uploadStates],
  );

  return {
    handlePresignedUpload,
    canUsePresignedUpload,
    getUploadState,
  };
}

// ==================== SMART UPLOAD STRATEGY ====================

/**
 * Generic smart upload hook that automatically chooses the best upload method:
 * - Small files (< 9MB): Use existing API Gateway upload
 * - Large files (≥ 9MB): Use presigned S3 upload to bypass 10MB limit
 *
 * @param mutations - The regular upload mutation hook
 * @param callbacks - Callbacks for managing pending items
 * @param presignedHook - The presigned upload hook for large files
 * @param config - Configuration for file type specific behavior
 */
export function useSmartUploadStrategy(
  mutations: SmartUploadMutations,
  callbacks: UploadCallbacks,
  presignedHook: PresignedUploadHook,
  config: SmartUploadConfig,
) {
  const { recResource } = useRecResource();

  // API Gateway limit is 10MB, but we use 9.5MB threshold for safety
  const API_GATEWAY_LIMIT = 9.5 * 1024 * 1024; // 9.5MB

  /**
   * Regular upload through API Gateway (for small files)
   */
  const doRegularUpload = useCallback(
    async ({
      rec_resource_id,
      file,
      name,
      tempId,
      onSuccess,
    }: {
      rec_resource_id: string;
      file: File;
      name: string;
      tempId: string;
      onSuccess?: () => void;
    }) => {
      try {
        const uploadParams = config.uploadParamBuilder(
          rec_resource_id,
          file,
          name,
        );
        await mutations.uploadMutation.mutateAsync(uploadParams);
        addSuccessNotification(
          `${config.fileTypeLabel} "${name}" uploaded successfully.`,
        );
        callbacks.removePending(tempId);
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);
        addErrorNotification(
          `${errorInfo.statusCode} - Failed to upload ${config.fileTypeLabel} "${name}": ${errorInfo.message}. Please try again.`,
        );
        callbacks.updatePending(tempId, {
          isUploading: false,
          uploadFailed: true,
        });
      }
    },
    [mutations.uploadMutation, callbacks, config],
  );

  /**
   * Smart upload handler that chooses the best method based on file size
   */
  const handleSmartUpload = useCallback(
    async (galleryFile: GalleryFile, onSuccess?: () => void) => {
      if (
        !recResource?.rec_resource_id ||
        !galleryFile.pendingFile ||
        !galleryFile.name
      ) {
        return;
      }

      const file = galleryFile.pendingFile;
      const fileSizeMB = file.size / 1024 / 1024;
      const usePresigned = file.size >= API_GATEWAY_LIMIT;

      if (usePresigned && presignedHook.canUsePresignedUpload(file)) {
        // Large file: Use presigned S3 upload
        addSuccessNotification(
          `Large ${config.fileTypeLabel} detected (${fileSizeMB.toFixed(1)}MB). Using direct cloud upload to bypass size limits...`,
        );
        await presignedHook.handlePresignedUpload(galleryFile, onSuccess);
      } else if (!usePresigned) {
        // Small file: Use regular API Gateway upload
        const pendingItem = callbacks.createPendingItem(galleryFile);
        callbacks.addPending(pendingItem);

        await doRegularUpload({
          rec_resource_id: recResource.rec_resource_id,
          file,
          name: galleryFile.name,
          tempId: galleryFile.id,
          onSuccess,
        });
      } else {
        // File is too large for both methods
        addErrorNotification(
          `${config.fileTypeLabel} "${galleryFile.name}" (${fileSizeMB.toFixed(1)}MB) is too large. Maximum supported size is 100MB.`,
        );
      }
    },
    [recResource, doRegularUpload, presignedHook, callbacks, config],
  );

  /**
   * Retry upload (maintains the same logic - chooses method based on file size)
   */
  const handleUploadRetry = useCallback(
    async (pendingItem: GalleryFile, onSuccess?: () => void) => {
      if (!recResource?.rec_resource_id || !pendingItem.pendingFile) {
        return;
      }
      callbacks.updatePending(pendingItem.id, {
        isUploading: true,
        uploadFailed: false,
      });

      // Use the same smart upload logic for retries
      await handleSmartUpload(pendingItem, onSuccess);
    },
    [handleSmartUpload, recResource, callbacks],
  );

  /**
   * Get upload method info for UI display
   */
  const getUploadMethodInfo = useCallback(
    (file: File) => {
      const fileSizeMB = file.size / 1024 / 1024;
      const usePresigned = file.size >= API_GATEWAY_LIMIT;

      if (usePresigned) {
        return {
          method: "presigned" as const,
          message: `Large ${config.fileTypeLabel} (${fileSizeMB.toFixed(1)}MB) - will use direct cloud upload`,
          icon: "☁️",
          canUpload: presignedHook.canUsePresignedUpload(file),
        };
      } else {
        return {
          method: "regular" as const,
          message: `Small ${config.fileTypeLabel} (${fileSizeMB.toFixed(1)}MB) - will use standard upload`,
          icon: "📤",
          canUpload: true,
        };
      }
    },
    [presignedHook, config],
  );

  return {
    handleUpload: handleSmartUpload,
    handleUploadRetry,
    getUploadMethodInfo,
    API_GATEWAY_LIMIT,
  };
}
