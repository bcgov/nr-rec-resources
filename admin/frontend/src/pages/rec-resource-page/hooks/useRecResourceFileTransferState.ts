import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import { recResourceDetailStore } from "../store/recResourceDetailStore";
import { setShowUploadOverlay } from "../store/recResourceFileTransferStore";
import { useDeleteModalState } from "./useDeleteModalState";
import { useDocumentListState } from "./useDocumentListState";
import { useDocumentUpload } from "./useDocumentUpload";
import { useFilePickerState } from "./useFilePickerState";
import { useGalleryActions } from "./useGalleryActions";

/**
 * Custom React hook to manage file picker and modal UI state for file uploads and deletes.
 * All document data is managed by React Query, not the store.
 * @returns Object containing state and handlers for file picker, upload modal, and delete modal.
 */
export function useRecResourceFileTransferState() {
  const { recResource } = useStore(recResourceDetailStore);

  // File picker state and handlers
  const {
    selectedFile,
    uploadFileName,
    showUploadOverlay,
    handleAddFileClick,
    handleCancelUpload,
    setUploadFileName,
  } = useFilePickerState();

  // Document list state and syncing
  const {
    pendingDocs,
    galleryDocuments,
    isDocumentUploadDisabled,
    isFetching,
    refetch,
  } = useDocumentListState(recResource?.rec_resource_id);

  // Upload operations
  const { handleUpload } = useDocumentUpload();

  // Gallery actions
  const { getActionHandler } = useGalleryActions();

  // Delete modal state
  const { showDeleteModal, docToDelete, setShowDeleteModal, setDocToDelete } =
    useDeleteModalState();

  // Enhanced upload handler that integrates with file picker state
  const getUploadHandler = useCallback(
    (rec_resource_id: string, onSuccess: () => void) => {
      return async () => {
        setShowUploadOverlay(false);
        await handleUpload(
          selectedFile,
          uploadFileName,
          onSuccess,
          handleCancelUpload,
        );
      };
    },
    [handleUpload, selectedFile, uploadFileName, handleCancelUpload],
  );

  // Return all state and handlers
  return {
    selectedFile,
    uploadFileName,
    showUploadOverlay,
    pendingDocs,
    handleAddFileClick,
    handleCancelUpload,
    setUploadFileName,
    getUploadHandler,
    getActionHandler,
    showDeleteModal,
    setShowDeleteModal,
    docToDelete,
    setDocToDelete,
    isDocumentUploadDisabled,
    isFetching,
    refetch,
    galleryDocuments,
  };
}
