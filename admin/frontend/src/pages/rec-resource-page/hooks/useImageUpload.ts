import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import {
  useFinalizeImageUpload,
  usePresignImageUpload,
} from '@/services/hooks/recreation-resource-admin/usePresignAndFinalizeHooks';
import { processImageToVariants } from '@/utils/imageProcessing';
import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';
import {
  addPendingImage,
  recResourceFileTransferStore,
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

  const { uploadConsentMetadata } = useStore(recResourceFileTransferStore);

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

  const buildConsent = useCallback(() => {
    if (!uploadConsentMetadata.consentFormFile) return undefined;
    return {
      date_taken: uploadConsentMetadata.dateTaken ?? undefined,
      contains_pii: uploadConsentMetadata.containsPii,
      photographer_type: uploadConsentMetadata.photographerType,
      photographer_name: uploadConsentMetadata.photographerName,
      consent_form: uploadConsentMetadata.consentFormFile,
    };
  }, [uploadConsentMetadata]);

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
        consent: buildConsent(),
      });
    },
    [
      executePresignedUpload,
      recResource,
      presignImageMutation,
      finalizeImageMutation,
      processFile,
      updateProgress,
      buildConsent,
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
        consent: buildConsent(),
      });
    },
    [
      executePresignedUpload,
      recResource,
      presignImageMutation,
      finalizeImageMutation,
      updateProgress,
      processFile,
      buildConsent,
    ],
  );

  return {
    handleUpload,
    handleUploadRetry,
  };
}
