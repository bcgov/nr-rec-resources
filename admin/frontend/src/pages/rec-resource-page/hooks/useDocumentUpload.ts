import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useUploadResourceDocument } from '@/services/hooks/recreation-resource-admin/useUploadResourceDocument';
import { useCallback } from 'react';
import {
  addPendingDoc,
  removePendingDoc,
  updatePendingDoc,
} from '../store/recResourceFileTransferStore';
import { GalleryDocument, GalleryFile } from '../types';
import { validateUploadFile } from './utils/validateUpload';
import { useFileUpload } from './utils/useFileUpload';

export function useDocumentUpload() {
  const { recResource } = useRecResource();
  const uploadResourceDocumentMutation = useUploadResourceDocument();
  const { executeUpload } = useFileUpload<GalleryDocument>();

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

      await executeUpload({
        recResourceId: recResourceId!,
        galleryFile: tempDoc,
        tempId: galleryFile.id,
        uploadMutation: uploadResourceDocumentMutation,
        updatePendingFile: updatePendingDoc,
        removePendingFile: removePendingDoc,
        successMessage: (fileName) =>
          `File "${fileName}" uploaded successfully.`,
        fileType: 'document',
        onSuccess,
      });
    },
    [executeUpload, recResource, uploadResourceDocumentMutation],
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

      await executeUpload({
        recResourceId: recResourceId!,
        galleryFile: pendingDoc as GalleryDocument,
        tempId: pendingDoc.id,
        uploadMutation: uploadResourceDocumentMutation,
        updatePendingFile: updatePendingDoc,
        removePendingFile: removePendingDoc,
        successMessage: (fileName) =>
          `File "${fileName}" uploaded successfully.`,
        fileType: 'document',
        onSuccess,
      });
    },
    [executeUpload, recResource, uploadResourceDocumentMutation],
  );

  return {
    handleUpload,
    handleUploadRetry,
  };
}
