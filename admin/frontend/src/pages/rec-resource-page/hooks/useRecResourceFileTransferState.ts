import { getMaxFilesByFileType } from '@/pages/rec-resource-page/helpers';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useStore } from '@tanstack/react-store';
import { useCallback, useEffect, useMemo } from 'react';
import {
  recResourceFileTransferStore,
  setGalleryDocuments,
  setGalleryImages,
} from '../store/recResourceFileTransferStore';
import { GalleryFile, GalleryFileAction, GalleryGeneralAction } from '../types';
import { useDocumentList } from './useDocumentList';
import { useFileNameValidation } from './useFileNameValidation';
import { useGalleryActions } from './useGalleryActions';
import { useImageList } from './useImageList';

/**
 * Custom React hook to manage file transfer state for recreation resource pages.
 * Provides gallery actions, document list state, image list state, and file picker functionality.
 * @returns Object containing essential state and handlers for both document and image operations.
 */
export function useRecResourceFileTransferState() {
  const { recResource } = useRecResource();

  const {
    showUploadOverlay,
    showDeleteModal,
    fileToDelete,
    uploadFileName,
    selectedFileForUpload,
    pendingDocs,
    galleryDocuments,
    pendingImages,
    galleryImages,
  } = useStore(recResourceFileTransferStore);

  // Document list state and syncing
  const {
    galleryDocumentsFromServer,
    isFetching,
    refetch: refetchDocuments,
  } = useDocumentList(recResource?.rec_resource_id);

  // Image list state and syncing
  const {
    galleryImagesFromServer,
    isFetching: isFetchingImages,
    refetch: refetchImages,
  } = useImageList(recResource?.rec_resource_id);

  // Sync galleryDocumentsFromServer to store
  useEffect(() => {
    setGalleryDocuments([...pendingDocs, ...galleryDocumentsFromServer]);
  }, [pendingDocs, galleryDocumentsFromServer]);

  // Sync galleryImagesFromServer to store
  useEffect(() => {
    setGalleryImages([...pendingImages, ...galleryImagesFromServer]);
  }, [pendingImages, galleryImagesFromServer]);

  // Gallery actions (includes upload modal state)
  const { handleFileAction, handleGeneralAction } = useGalleryActions();

  // Document action handlers
  const getDocumentFileActionHandler = useCallback(
    (action: GalleryFileAction, file: GalleryFile) => {
      return () => {
        handleFileAction(action, file, refetchDocuments);
      };
    },
    [handleFileAction, refetchDocuments],
  );
  const getDocumentGeneralActionHandler = useCallback(
    (action: GalleryGeneralAction) => {
      return () => {
        handleGeneralAction(action, 'document', refetchDocuments);
      };
    },
    [handleGeneralAction, refetchDocuments],
  );

  // Image action handlers
  const getImageFileActionHandler = useCallback(
    (action: GalleryFileAction, file: GalleryFile) => {
      return () => {
        handleFileAction(action, file, refetchImages);
      };
    },
    [handleFileAction, refetchImages],
  );
  const getImageGeneralActionHandler = useCallback(
    (action: GalleryGeneralAction) => {
      return () => {
        handleGeneralAction(action, 'image', refetchImages);
      };
    },
    [handleGeneralAction, refetchImages],
  );

  // Calculate upload disabled state based on total documents (server + pending)
  const isDocumentUploadDisabled = useMemo(() => {
    const totalDocCount = galleryDocuments.length;
    const hasUploadingDoc = galleryDocuments.some((doc) => doc.isUploading);
    return (
      totalDocCount >= getMaxFilesByFileType('document') || hasUploadingDoc
    );
  }, [galleryDocuments]);

  // Calculate upload disabled state based on total images (server + pending)
  const isImageUploadDisabled = useMemo(() => {
    const totalImageCount = galleryImages.length;
    const hasUploadingImage = galleryImages.some((image) => image.isUploading);
    return (
      totalImageCount >= getMaxFilesByFileType('image') || hasUploadingImage
    );
  }, [galleryImages]);

  // File name validation
  const { fileNameError } = useFileNameValidation();

  // Return only the essential exports
  return {
    // Gallery actions and upload modal
    getDocumentFileActionHandler,
    getDocumentGeneralActionHandler,
    getImageFileActionHandler,
    getImageGeneralActionHandler,

    // Document list
    galleryDocuments,
    isDocumentUploadDisabled,
    isFetching,

    // Image list
    galleryImages,
    isImageUploadDisabled,
    isFetchingImages,

    // Upload modal state
    uploadModalState: {
      showUploadOverlay,
      uploadFileName,
      selectedFileForUpload,
      fileNameError,
    },

    // Delete modal
    deleteModalState: {
      showDeleteModal,
      fileToDelete,
    },
  };
}
