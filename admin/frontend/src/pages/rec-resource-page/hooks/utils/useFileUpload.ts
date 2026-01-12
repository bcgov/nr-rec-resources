import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useCallback } from 'react';
import { GalleryFile } from '../../types';
import { formatUploadError } from './fileErrorMessages';
import { validateUploadFile } from './validateUpload';

interface FileUploadConfig<T extends GalleryFile> {
  recResourceId: string | undefined;
  galleryFile: GalleryFile;
  tempId: string;
  onSuccess?: () => void;
  uploadMutation: {
    mutateAsync: (params: any) => Promise<any>;
  };
  processFile?: (
    file: File,
    onProgress?: (progress: number, stage: string) => void,
  ) => Promise<any>;
  updatePendingFile: (id: string, updates: Partial<T>) => void;
  removePendingFile: (id: string) => void;
  successMessage: (fileName: string) => string;
  fileType: 'image' | 'document';
}

export function useFileUpload<T extends GalleryFile>() {
  const executeUpload = useCallback(
    async ({
      recResourceId,
      galleryFile,
      tempId,
      onSuccess,
      uploadMutation,
      processFile,
      updatePendingFile,
      removePendingFile,
      successMessage,
      fileType,
    }: FileUploadConfig<T>) => {
      if (!validateUploadFile(recResourceId, galleryFile)) {
        return;
      }

      const file = galleryFile.pendingFile!;
      const fileName = galleryFile.name;

      try {
        if (fileType === 'image') {
          updatePendingFile(tempId, {
            isUploading: true,
            uploadFailed: false,
            processingProgress: 0,
            processingStage: 'Validating image...',
          } as Partial<T>);
        } else {
          updatePendingFile(tempId, {
            isUploading: true,
            uploadFailed: false,
          } as Partial<T>);
        }

        let uploadParams: any;

        if (processFile) {
          const processed = await processFile(file, (progress, stage) => {
            if (fileType === 'image') {
              updatePendingFile(tempId, {
                processingProgress: progress,
                processingStage: stage,
              } as Partial<T>);
            }
          });

          if (fileType === 'image') {
            updatePendingFile(tempId, {
              processingStage: 'Uploading to server...',
              processingProgress: 100,
            } as Partial<T>);
          }

          uploadParams = {
            recResourceId,
            ...processed,
            fileName,
          };
        } else {
          uploadParams = {
            recResourceId,
            file,
            fileName,
          };
        }

        await uploadMutation.mutateAsync(uploadParams);

        addSuccessNotification(successMessage(fileName));
        removePendingFile(tempId);
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);
        const isProcessingError = errorInfo.statusCode === 0;
        const errorMessage = formatUploadError(
          fileName,
          errorInfo,
          isProcessingError,
        );

        addErrorNotification(errorMessage);
        updatePendingFile(tempId, {
          isUploading: false,
          uploadFailed: true,
          ...(fileType === 'image'
            ? {
                processingStage: undefined,
                processingProgress: undefined,
              }
            : {}),
        } as Partial<T>);
      }
    },
    [],
  );

  return { executeUpload };
}
