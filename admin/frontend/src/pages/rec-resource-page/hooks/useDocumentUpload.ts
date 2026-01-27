import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import {
  useFinalizeDocUpload,
  usePresignDocUpload,
} from '@/services/hooks/recreation-resource-admin/usePresignAndFinalizeHooks';
import { useCallback } from 'react';
import {
  addPendingDoc,
  removePendingDoc,
  updatePendingDoc,
} from '../store/recResourceFileTransferStore';
import { GalleryDocument, GalleryFile } from '../types';
import { usePresignedUpload } from './utils/usePresignedUpload';
import { validateUploadFile } from './utils/validateUpload';

export function useDocumentUpload() {
  const { recResource } = useRecResource();
  const presignDocMutation = usePresignDocUpload();
  const finalizeDocMutation = useFinalizeDocUpload();
  const { executePresignedUpload } = usePresignedUpload<GalleryDocument>();

  const handleUpload = useCallback(
    async (galleryFile: GalleryFile, onSuccess?: () => void) => {
      const recResourceId = recResource?.rec_resource_id;
      if (!validateUploadFile(recResourceId, galleryFile)) {
        return;
      }

      const tempDoc: GalleryDocument = {
        ...galleryFile,
        isUploading: true,
        pendingFile: galleryFile.pendingFile,
        type: 'document',
      };
      addPendingDoc(tempDoc);

      await executePresignedUpload({
        recResourceId: recResourceId!,
        galleryFile: tempDoc,
        tempId: galleryFile.id,
        presignMutation: presignDocMutation,
        finalizeMutation: finalizeDocMutation,
        updatePendingFile: updatePendingDoc,
        removePendingFile: removePendingDoc,
        successMessage: (fileName) =>
          `File "${fileName}" uploaded successfully.`,
        fileType: 'document',
        onSuccess,
      });
    },
    [
      executePresignedUpload,
      recResource,
      presignDocMutation,
      finalizeDocMutation,
    ],
  );

  const handleUploadRetry = useCallback(
    async (pendingDoc: GalleryFile, onSuccess?: () => void) => {
      const recResourceId = recResource?.rec_resource_id;
      if (!validateUploadFile(recResourceId, pendingDoc, ['pendingFile'])) {
        return;
      }

      updatePendingDoc(pendingDoc.id, {
        isUploading: true,
        uploadFailed: false,
      });

      await executePresignedUpload({
        recResourceId: recResourceId!,
        galleryFile: pendingDoc as GalleryDocument,
        tempId: pendingDoc.id,
        presignMutation: presignDocMutation,
        finalizeMutation: finalizeDocMutation,
        updatePendingFile: updatePendingDoc,
        removePendingFile: removePendingDoc,
        successMessage: (fileName) =>
          `File "${fileName}" uploaded successfully.`,
        fileType: 'document',
        onSuccess,
      });
    },
    [
      executePresignedUpload,
      recResource,
      presignDocMutation,
      finalizeDocMutation,
    ],
  );

  return {
    handleUpload,
    handleUploadRetry,
  };
}
