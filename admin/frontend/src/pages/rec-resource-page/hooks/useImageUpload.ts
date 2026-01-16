import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useUploadResourceImage } from '@/services/hooks/recreation-resource-admin/useUploadResourceImage';
import { processImageToVariants } from '@/utils/imageProcessing';
import { useCallback } from 'react';
import {
  addPendingImage,
  removePendingImage,
  updatePendingImage,
} from '../store/recResourceFileTransferStore';
import { GalleryFile, GalleryImage } from '../types';
import { validateUploadFile } from './utils/validateUpload';
import { useFileUpload } from './utils/useFileUpload';

export function useImageUpload() {
  const { recResource } = useRecResource();
  const uploadResourceImageMutation = useUploadResourceImage();
  const { executeUpload } = useFileUpload<GalleryImage>();

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

      await executeUpload({
        recResourceId: recResourceId!,
        galleryFile: galleryFile as GalleryImage,
        tempId: galleryFile.id,
        uploadMutation: uploadResourceImageMutation,
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
      executeUpload,
      recResource,
      uploadResourceImageMutation,
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

      await executeUpload({
        recResourceId: recResourceId!,
        galleryFile: pendingImage as GalleryImage,
        tempId: pendingImage.id,
        uploadMutation: uploadResourceImageMutation,
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
      executeUpload,
      recResource,
      uploadResourceImageMutation,
      processFile,
      updateProgress,
    ],
  );

  return {
    handleUpload,
    handleUploadRetry,
  };
}
