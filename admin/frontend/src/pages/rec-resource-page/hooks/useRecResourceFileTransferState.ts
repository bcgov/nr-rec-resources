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

  // Sync galleryImagesFromServer to store.
  // uploadComplete pending images bridge the GuardDuty scan window: they stay
  // visible (using a local blob URL as previewUrl) until navigation. Their id
  // has been updated to the real server image_id, so we filter out the matching
  // server entry to avoid showing the same image twice.
  useEffect(() => {
    const bridgedIds = new Set(
      pendingImages.filter((img) => img.uploadComplete).map((img) => img.id),
    );
    const serverImages =
      bridgedIds.size === 0
        ? galleryImagesFromServer
        : galleryImagesFromServer.filter((img) => !bridgedIds.has(img.id));
    setGalleryImages([...pendingImages, ...serverImages]);
  }, [pendingImages, galleryImagesFromServer]);

  const { handleFileAction, handleGeneralAction } = useGalleryActions();

  const createFileActionHandler = useCallback(
    (refetch: () => void) =>
      (action: GalleryFileAction, file: GalleryFile) =>
      () => {
        handleFileAction(action, file, refetch);
      },
    [handleFileAction],
  );

  const createGeneralActionHandler = useCallback(
    (fileType: 'document' | 'image', refetch: () => void) =>
      (action: GalleryGeneralAction) =>
      () => {
        handleGeneralAction(action, fileType, refetch);
      },
    [handleGeneralAction],
  );

  const getDocumentFileActionHandler = useMemo(
    () => createFileActionHandler(refetchDocuments),
    [createFileActionHandler, refetchDocuments],
  );

  const getDocumentGeneralActionHandler = useMemo(
    () => createGeneralActionHandler('document', refetchDocuments),
    [createGeneralActionHandler, refetchDocuments],
  );

  const getImageFileActionHandler = useMemo(
    () => createFileActionHandler(refetchImages),
    [createFileActionHandler, refetchImages],
  );

  const getImageGeneralActionHandler = useMemo(
    () => createGeneralActionHandler('image', refetchImages),
    [createGeneralActionHandler, refetchImages],
  );

  const isDocumentMaxFilesReached = useMemo(() => {
    return galleryDocuments.length >= getMaxFilesByFileType('document');
  }, [galleryDocuments]);

  const isImageMaxFilesReached = useMemo(() => {
    return galleryImages.length >= getMaxFilesByFileType('image');
  }, [galleryImages]);

  // Calculate upload disabled state based on total documents (server + pending)
  const isDocumentUploadDisabled = useMemo(() => {
    const hasUploadingDoc = galleryDocuments.some((doc) => doc.isUploading);
    return isDocumentMaxFilesReached || hasUploadingDoc;
  }, [galleryDocuments, isDocumentMaxFilesReached]);

  // Calculate upload disabled state based on total images (server + pending)a
  const isImageUploadDisabled = useMemo(() => {
    const hasUploadingImage = galleryImages.some((image) => image.isUploading);
    return isImageMaxFilesReached || hasUploadingImage;
  }, [galleryImages, isImageMaxFilesReached]);

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
    isDocumentMaxFilesReached,
    isDocumentUploadDisabled,
    isFetching,

    // Image list
    galleryImages,
    isImageMaxFilesReached,
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
