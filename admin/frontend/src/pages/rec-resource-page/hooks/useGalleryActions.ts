import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import { handleAddFileClick, handleAddPdfFileClick } from "../helpers";
import {
  hideDeleteModal,
  recResourceFileTransferStore,
  removePendingDoc,
  resetUploadState,
  showDeleteModalForDoc,
} from "../store/recResourceFileTransferStore";
import { GalleryFile, GalleryFileAction, GalleryGeneralAction } from "../types";
import { useDocumentDelete } from "./useDocumentDelete";
import { useDocumentUpload } from "./useDocumentUpload";
import { useFileDownload } from "./useFileDownload";

/**
 * Hook to manage document gallery actions.
 * Handles view, download, retry, delete, and upload document operations.
 */
export function useGalleryActions() {
  const downloadMutation = useFileDownload();
  const { handleUploadRetry, handleUpload } = useDocumentUpload();
  const { handleDelete } = useDocumentDelete();

  const { selectedFileForUpload, uploadFileName } = useStore(
    recResourceFileTransferStore,
  );

  // Handler for gallery actions that require a file
  const handleFileAction = useCallback(
    (action: GalleryFileAction, file: GalleryFile, onSuccess?: () => void) => {
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
        case "dismiss":
          removePendingDoc(file.id);
          break;

        default:
          break;
      }
    },
    [handleUploadRetry, downloadMutation, handleDelete, showDeleteModalForDoc],
  );

  // Handler for gallery actions that do not require a file
  const handleGeneralAction = useCallback(
    (action: GalleryGeneralAction, onSuccess?: () => void) => {
      switch (action) {
        case "cancel-delete":
          hideDeleteModal();
          break;
        case "upload":
          handleAddPdfFileClick();
          break;
        case "confirm-upload":
          if (selectedFileForUpload && uploadFileName) {
            resetUploadState();
            handleUpload(selectedFileForUpload, uploadFileName, onSuccess);
          }
          break;
        case "cancel-upload":
          resetUploadState();
          break;
        case "confirm-delete":
          handleDelete(onSuccess);
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
      handleUpload,
    ],
  );

  return {
    handleFileAction,
    handleGeneralAction,
  };
}
