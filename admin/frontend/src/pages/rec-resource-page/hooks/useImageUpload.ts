import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import {
  useFinalizeImageUpload,
  usePresignImageUpload,
} from '@/services/hooks/recreation-resource-admin/usePresignAndFinalizeHooks';
import { processImageToVariants } from '@/utils/imageProcessing';
import { useCallback } from 'react';
import {
  addPendingImage,
  removePendingImage,
  updatePendingImage,
} from '../store/recResourceFileTransferStore';
import { GalleryFile, GalleryImage } from '../types';
import { usePresignedUpload } from './utils/usePresignedUpload';
import { validateUploadFile } from './utils/validateUpload';

export function useImageUpload() {
  const { recResource } = useRecResource();
  const presignImageMutation = usePresignImageUpload();
  const finalizeImageMutation = useFinalizeImageUpload();
  const { executePresignedUpload } = usePresignedUpload<GalleryImage>();

  const updateProgress = useCallback(
    (tempId: string, updates: Partial<GalleryImage>) => {
      updatePendingImage(tempId, updates);
    },
    [],
  );

  const processFile = useCallback(
    async (
      file: File,
      onProgress?: (progress: number, stage: string) => void,
    ) => {
      const variants = await processImageToVariants({
        file,
        onProgress,
      });
      return { variants };
    },
    [],
  );

  const handleUpload = useCallback(
    async (galleryFile: GalleryFile, onSuccess?: () => void) => {
      const recResourceId = recResource?.rec_resource_id;
      if (!validateUploadFile(recResourceId, galleryFile)) {
        return;
      }

      addPendingImage({
        ...galleryFile,
        variants: [],
        previewUrl: '',
        type: 'image',
        isUploading: true,
      } as GalleryImage);

      await executePresignedUpload({
        recResourceId: recResourceId!,
        galleryFile: galleryFile as GalleryImage,
        tempId: galleryFile.id,
        presignMutation: presignImageMutation,
        finalizeMutation: finalizeImageMutation,
        processFile,
        updatePendingFile: updateProgress,
        removePendingFile: removePendingImage,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
        onSuccess,
      });
    },
    [
      executePresignedUpload,
      recResource,
      presignImageMutation,
      finalizeImageMutation,
      processFile,
      updateProgress,
    ],
  );

  const handleUploadRetry = useCallback(
    async (pendingImage: GalleryFile, onSuccess?: () => void) => {
      const recResourceId = recResource?.rec_resource_id;
      if (!validateUploadFile(recResourceId, pendingImage, ['pendingFile'])) {
        return;
      }

      updateProgress(pendingImage.id, {
        isUploading: true,
        uploadFailed: false,
      });

      await executePresignedUpload({
        recResourceId: recResourceId!,
        galleryFile: pendingImage as GalleryImage,
        tempId: pendingImage.id,
        presignMutation: presignImageMutation,
        finalizeMutation: finalizeImageMutation,
        processFile,
        updatePendingFile: updateProgress,
        removePendingFile: removePendingImage,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
        onSuccess,
      });
    },
    [
      executePresignedUpload,
      recResource,
      presignImageMutation,
      finalizeImageMutation,
      updateProgress,
      processFile,
    ],
  );

  return {
    handleUpload,
    handleUploadRetry,
  };
}
