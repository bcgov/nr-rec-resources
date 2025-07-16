import { useStore } from "@tanstack/react-store";
import { useCallback, useEffect, useMemo } from "react";
import { MAX_DOCUMENTS_PER_REC_RESOURCE } from "../constants";
import { recResourceDetailStore } from "../store/recResourceDetailStore";
import {
  recResourceFileTransferStore,
  setGalleryDocuments,
} from "../store/recResourceFileTransferStore";
import { GalleryFile, GalleryFileAction, GalleryGeneralAction } from "../types";
import { useDocumentList } from "./useDocumentList";
import { useGalleryActions } from "./useGalleryActions";

/**
 * Custom React hook to manage file transfer state for recreation resource pages.
 * Provides gallery actions, document list state, and file picker functionality.
 * @returns Object containing essential state and handlers for file operations.
 */
export function useRecResourceFileTransferState() {
  const { recResource } = useStore(recResourceDetailStore);

  const {
    showUploadOverlay,
    showDeleteModal,
    docToDelete,
    uploadFileName,
    selectedFileForUpload,
    pendingDocs,
    galleryDocuments,
  } = useStore(recResourceFileTransferStore);

  // Document list state and syncing
  const {
    galleryDocumentsFromServer,
    isFetching,
    refetch: refetchDocuments,
  } = useDocumentList(recResource?.rec_resource_id);

  // Sync galleryDocumentsFromServer to store
  useEffect(() => {
    setGalleryDocuments([...pendingDocs, ...galleryDocumentsFromServer]);
  }, [pendingDocs, galleryDocumentsFromServer]);

  // Gallery actions (includes upload modal state)
  const { handleFileAction, handleGeneralAction } = useGalleryActions();

  // Document action handlers
  const getDocumentFileActionHandler = useCallback(
    (action: GalleryFileAction, file: GalleryFile) => {
      return () => {
        handleFileAction(action, file, refetchDocuments);
      };
    },
    [handleFileAction],
  );
  const getDocumentGeneralActionHandler = useCallback(
    (action: GalleryGeneralAction) => {
      return () => {
        handleGeneralAction(action, refetchDocuments);
      };
    },
    [handleGeneralAction],
  );

  // Calculate upload disabled state based on total documents (server + pending)
  const isDocumentUploadDisabled = useMemo(() => {
    const totalDocCount = galleryDocuments.length;
    return totalDocCount >= MAX_DOCUMENTS_PER_REC_RESOURCE;
  }, [galleryDocuments.length]);

  // Return only the essential exports
  return {
    // Gallery actions and upload modal
    getDocumentFileActionHandler,
    getDocumentGeneralActionHandler,

    // Document list
    galleryDocuments,
    isDocumentUploadDisabled,
    isFetching,

    // Upload modal state
    uploadModalState: {
      showUploadOverlay,
      uploadFileName,
      selectedFileForUpload,
    },

    // Delete modal
    deleteModalState: {
      showDeleteModal,
      docToDelete,
    },
  };
}
