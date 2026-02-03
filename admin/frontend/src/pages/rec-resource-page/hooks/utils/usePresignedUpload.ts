/**
 * Orchestrator hook for presigned URL-based S3 uploads with retries
 * Handles presign → generate/process → S3 upload → finalize flow
 */

import { useS3Upload } from '@/services/hooks/recreation-resource-admin/useS3Upload';
import { ConsentFormParams } from '@/services/hooks/recreation-resource-admin/usePresignAndFinalizeHooks';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useCallback } from 'react';
import { GalleryFile } from '../../types';
import { formatUploadError } from './fileErrorMessages';

interface PresignedUploadConfig<T extends GalleryFile> {
  recResourceId: string;
  galleryFile: GalleryFile;
  tempId: string;
  onSuccess?: () => void;
  presignMutation: {
    mutateAsync: (params: any) => Promise<any>;
  };
  finalizeMutation: {
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
  consent?: ConsentFormParams;
}

interface ImageUploadResult {
  variants: Array<{
    sizeCode: string;
    blob: Blob;
    size: number;
  }>;
}

interface DocUploadResult {
  fileName: string;
  extension: string;
  size: number;
}

/**
 * Hook providing presigned upload orchestration
 */
export function usePresignedUpload<T extends GalleryFile>() {
  const s3UploadMutation = useS3Upload();

  const executePresignedUpload = useCallback(
    async ({
      recResourceId,
      galleryFile,
      tempId,
      onSuccess,
      presignMutation,
      finalizeMutation,
      processFile,
      updatePendingFile,
      removePendingFile,
      successMessage,
      fileType,
      consent,
    }: PresignedUploadConfig<T>) => {
      const file = galleryFile.pendingFile!;
      const fileName = galleryFile.name; // User-edited filename (without extension)

      try {
        // Step 1: Request presigned URLs from backend
        if (fileType === 'image') {
          updatePendingFile(tempId, {
            isUploading: true,
            uploadFailed: false,
            processingStage: 'Requesting presigned URLs...',
          } as Partial<T>);
        } else {
          updatePendingFile(tempId, {
            isUploading: true,
            uploadFailed: false,
            processingStage: 'Requesting presigned URL...',
          } as Partial<T>);
        }

        // For both documents and images, use user-edited filename and append extension from the actual file
        const defaultExtension = fileType === 'document' ? 'pdf' : 'webp';
        const extension = file.name.split('.').pop() || defaultExtension;
        const fileNameWithExtension = `${fileName}.${extension}`;

        const presignResponse = await presignMutation.mutateAsync({
          recResourceId,
          fileName: fileNameWithExtension,
        });

        // Step 2: Process file (generate variants for images, or just prepare for docs)
        let processedData: ImageUploadResult | DocUploadResult;

        if (fileType === 'image' && processFile) {
          updatePendingFile(tempId, {
            processingStage: 'Processing image variants...',
          } as Partial<T>);

          processedData = await processFile(file, (progress, stage) => {
            updatePendingFile(tempId, {
              processingStage: stage,
            } as Partial<T>);
          });
        } else if (fileType === 'document') {
          const extension = file.name.split('.').pop() || 'pdf';
          // Use the user-edited filename (already without extension)
          processedData = {
            fileName: fileName,
            extension,
            size: file.size,
          };
        } else {
          throw new Error('Invalid fileType or missing processFile');
        }

        // Step 3: Upload to S3 directly
        if (fileType === 'image') {
          const imageData = processedData as ImageUploadResult;
          const presignedUrls = presignResponse.presigned_urls;
          const variantSizes: Record<string, number> = {};

          updatePendingFile(tempId, {
            processingStage: 'Uploading variants to S3...',
          } as Partial<T>);

          // Upload each variant to S3 in parallel
          const uploadPromises = imageData.variants.map((variant) => {
            const presignedUrl = presignedUrls.find(
              (p: any) => p.size_code === variant.sizeCode,
            );

            if (!presignedUrl) {
              throw new Error(
                `No presigned URL for variant ${variant.sizeCode}`,
              );
            }

            variantSizes[variant.sizeCode] = variant.blob.size;

            return s3UploadMutation.mutateAsync({
              presignedUrl: presignedUrl.url,
              blob: variant.blob,
              contentType: 'image/webp',
              s3Key: presignedUrl.key,
            });
          });

          await Promise.all(uploadPromises);

          // Step 4: Finalize upload (create DB record)
          updatePendingFile(tempId, {
            processingStage: 'Finalizing upload...',
          } as Partial<T>);

          await finalizeMutation.mutateAsync({
            recResourceId,
            image_id: presignResponse.image_id,
            file_name: fileName,
            file_size_original: variantSizes['original'],
            consent,
          });
        } else {
          // Document upload
          const docData = processedData as DocUploadResult;
          const presignedUrl = presignResponse.url;

          updatePendingFile(tempId, {
            processingStage: 'Uploading to S3...',
          } as Partial<T>);

          await s3UploadMutation.mutateAsync({
            presignedUrl,
            blob: file,
            contentType: 'application/pdf',
            s3Key: presignResponse.key,
          });

          // Step 4: Finalize upload (create DB record)
          updatePendingFile(tempId, {
            processingStage: 'Finalizing upload...',
          } as Partial<T>);

          await finalizeMutation.mutateAsync({
            recResourceId,
            document_id: presignResponse.document_id,
            file_name: docData.fileName,
            extension: docData.extension,
            file_size: docData.size,
          });
        }

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
              }
            : {}),
        } as Partial<T>);
      }
    },
    [s3UploadMutation],
  );

  return { executePresignedUpload };
}
