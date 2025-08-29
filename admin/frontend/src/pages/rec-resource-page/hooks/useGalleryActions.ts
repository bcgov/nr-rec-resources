import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';
import { handleAddFileByType, handleAddFileClick } from '../helpers';
import {
  hideDeleteModal,
  recResourceFileTransferStore,
  removePendingDoc,
  removePendingImage,
  resetUploadState,
  showDeleteModalForFile,
} from '../store/recResourceFileTransferStore';
import { GalleryFile, GalleryFileAction, GalleryGeneralAction } from '../types';
import { useDocumentDelete } from './useDocumentDelete';
import { useDocumentUpload } from './useDocumentUpload';
import { useFileDownload } from './useFileDownload';
import { useImageDelete } from './useImageDelete';
import { useImageUpload } from './useImageUpload';

/**
 * Hook to manage gallery actions for both documents and images.
 * Handles view, download, retry, delete, and upload operations.
 */
export function useGalleryActions() {
  const downloadMutation = useFileDownload();
  const {
    handleUploadRetry: handleDocumentUploadRetry,
    handleUpload: handleDocumentUpload,
  } = useDocumentUpload();
  const {
    handleUploadRetry: handleImageUploadRetry,
    handleUpload: handleImageUpload,
  } = useImageUpload();
  const { handleDelete: handleDocumentDelete } = useDocumentDelete();
  const { handleDelete: handleImageDelete } = useImageDelete();

  const { selectedFileForUpload, uploadFileName, fileToDelete } = useStore(
    recResourceFileTransferStore,
  );

  // Handler for gallery actions that require a file
  const handleFileAction = useCallback(
    (action: GalleryFileAction, file: GalleryFile, onSuccess?: () => void) => {
      switch (action) {
        case 'view':
          window.open(file.url, '_blank');
          break;
        case 'download':
          downloadMutation.mutate({ file });
          break;
        case 'retry': {
          const isImageRetry = file.type === 'image';
          if (isImageRetry) {
            handleImageUploadRetry(file, onSuccess);
          } else {
            handleDocumentUploadRetry(file, onSuccess);
          }
          break;
        }
        case 'delete':
          showDeleteModalForFile(file);
          break;
        case 'dismiss': {
          if (file.type === 'image') {
            removePendingImage(file.id);
          } else {
            removePendingDoc(file.id);
          }
          break;
        }
        default:
          break;
      }
    },
    [
      handleDocumentUploadRetry,
      handleImageUploadRetry,
      downloadMutation,
      showDeleteModalForFile,
    ],
  );

  // Handler for gallery actions that do not require a file
  const handleGeneralAction = useCallback(
    (
      action: GalleryGeneralAction,
      fileType: GalleryFile['type'],
      onSuccess?: () => void,
    ) => {
      switch (action) {
        case 'cancel-delete':
          hideDeleteModal();
          break;
        case 'upload':
          handleAddFileByType(fileType);
          break;
        case 'confirm-upload':
          if (selectedFileForUpload?.pendingFile && uploadFileName) {
            resetUploadState();
            // Create updated gallery file with the user-entered filename
            const updatedGalleryFile = {
              ...selectedFileForUpload,
              name: uploadFileName,
            };

            if (fileType === 'image') {
              handleImageUpload(updatedGalleryFile, onSuccess);
            } else {
              handleDocumentUpload(updatedGalleryFile, onSuccess);
            }
          }
          break;
        case 'cancel-upload':
          resetUploadState();
          break;
        case 'confirm-delete':
          // Determine which delete function to use based on the file type
          if (fileToDelete?.type === 'image') {
            handleImageDelete(onSuccess);
          } else if (fileToDelete?.type === 'document') {
            handleDocumentDelete(onSuccess);
          }
          hideDeleteModal();
          break;
        default:
          break;
      }
    },
    [
      hideDeleteModal,
      handleAddFileClick,
      selectedFileForUpload,
      uploadFileName,
      handleDocumentUpload,
      handleImageUpload,
      handleDocumentDelete,
      handleImageDelete,
      fileToDelete,
    ],
  );

  return {
    handleFileAction,
    handleGeneralAction,
  };
}
