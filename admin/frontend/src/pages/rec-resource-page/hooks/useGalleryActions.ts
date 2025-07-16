import { useCallback } from "react";
import { GalleryAction, GalleryFile } from "../types";
import { useDeleteModalState } from "./useDeleteModalState";
import { useDocumentDelete } from "./useDocumentDelete";
import { useDocumentUpload } from "./useDocumentUpload";
import { useDownloadFileMutation } from "./useDownloadFileMutation";

/**
 * Hook to manage document gallery actions.
 * Handles view, download, retry, delete, and other document operations.
 */
export function useGalleryActions() {
  const downloadMutation = useDownloadFileMutation();
  const { handleUploadRetry } = useDocumentUpload();
  const { handleDelete } = useDocumentDelete();
  const { showDeleteModalForDoc, hideDeleteModal } = useDeleteModalState();

  // Centralized document action handler
  const handleGalleryAction = useCallback(
    (action: GalleryAction, file: GalleryFile, refetch: () => void) => {
      switch (action) {
        case "view":
          window.open(file.url, "_blank");
          break;
        case "download":
          downloadMutation.mutate({ file });
          break;
        case "retry":
          handleUploadRetry(file, refetch);
          break;
        case "delete":
          showDeleteModalForDoc(file);
          break;
        case "confirm-delete":
          handleDelete(file, refetch);
          hideDeleteModal();
          refetch();
          break;
        case "cancel-delete":
          hideDeleteModal();
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
  };
}
