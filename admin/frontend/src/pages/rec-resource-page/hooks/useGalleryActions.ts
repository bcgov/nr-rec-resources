import { useCallback } from "react";
import { handleAddFileClick } from "../helpers";
import { GalleryAction, GalleryFile } from "../types";
import { useDeleteModalState } from "./useDeleteModalState";
import { useDocumentDelete } from "./useDocumentDelete";
import { useDocumentUpload } from "./useDocumentUpload";
import { useDownloadFileMutation } from "./useDownloadFileMutation";
import { useFilePickerState } from "./useFilePickerState";

/**
 * Hook to manage document gallery actions.
 * Handles view, download, retry, delete, and upload document operations.
 */
export function useGalleryActions() {
  const downloadMutation = useDownloadFileMutation();
  const { handleUploadRetry, handleUpload } = useDocumentUpload();
  const { handleDelete } = useDocumentDelete();
  const { showDeleteModalForDoc, hideDeleteModal } = useDeleteModalState();

  // Use the centralized file picker state for upload functionality
  const {
    selectedFile,
    uploadFileName,
    showUploadOverlay,
    handleCancelUpload,
    setUploadFileName,
  } = useFilePickerState();

  // Centralized document action handler
  const handleGalleryAction = useCallback(
    (action: GalleryAction, file: GalleryFile, onSuccess: () => void) => {
      switch (action) {
        case "view":
          window.open(file.url, "_blank");
          break;
        case "download":
          downloadMutation.mutate({ file });
          break;
        case "retry":
          handleUploadRetry(file, onSuccess);
          break;
        case "delete":
          showDeleteModalForDoc(file);
          break;
        case "confirm-delete":
          handleDelete(file, onSuccess);
          hideDeleteModal();
          onSuccess();
          break;
        case "cancel-delete":
          hideDeleteModal();
          break;
        case "upload":
          handleAddFileClick();
          break;
        case "confirm-upload":
          if (selectedFile && uploadFileName) {
            handleCancelUpload();
            handleUpload(
              selectedFile,
              uploadFileName,
              onSuccess,
              handleCancelUpload,
            );
          }
          break;
        case "cancel-upload":
          handleCancelUpload();
          break;
        default:
          break;
      }
    },
    [
      handleUploadRetry,
      downloadMutation,
      handleDelete,
      showDeleteModalForDoc,
      hideDeleteModal,
      handleCancelUpload,
      selectedFile,
      uploadFileName,
      handleUpload,
    ],
  );

  const getActionHandler = useCallback(
    (onSuccess: () => void) => {
      return (action: GalleryAction, file: GalleryFile) => {
        handleGalleryAction(action, file, onSuccess);
      };
    },
    [handleGalleryAction],
  );

  return {
    getActionHandler,
    // Upload modal state for components that need to render the modal
    uploadModalState: {
      showUploadModal: showUploadOverlay,
      selectedFile,
      uploadFileName,
      setUploadFileName,
    },
  };
}
