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
  showImageLightboxForImage,
  showPhotoDetailsForImage,
} from '../store/recResourceFileTransferStore';
import {
  GalleryFile,
  GalleryFileAction,
  GalleryGeneralAction,
  GalleryImage,
} from '../types';
import { useConsentDownload } from './useConsentDownload';
import { useDocumentDelete } from './useDocumentDelete';
import { useDocumentUpload } from './useDocumentUpload';
import { useFileDownload } from './useFileDownload';
import { useImageDelete } from './useImageDelete';
import { useImageUpload } from './useImageUpload';
import { useRecResource } from './useRecResource';

/**
 * Hook to manage gallery actions for both documents and images.
 * Handles view, download, retry, delete, and upload operations.
 */
export function useGalleryActions() {
  const { rec_resource_id } = useRecResource();
  const downloadMutation = useFileDownload();
  const consentDownloadMutation = useConsentDownload();
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
          // For images, open in lightbox; for documents, open in new tab
          if (file.type === 'image') {
            showImageLightboxForImage(file as GalleryImage);
          } else {
            window.open(file.url, '_blank');
          }
          break;
        case 'viewDetails':
          // Only images can have details viewed
          if (file.type === 'image') {
            showPhotoDetailsForImage(file as GalleryImage);
          }
          break;

        case 'download':
          downloadMutation.mutate({ file });
          break;
        case 'downloadConsent':
          if (rec_resource_id && file.type === 'image') {
            consentDownloadMutation.mutate({
              recResourceId: rec_resource_id,
              imageId: file.id,
            });
          }
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
      consentDownloadMutation,
      rec_resource_id,
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
