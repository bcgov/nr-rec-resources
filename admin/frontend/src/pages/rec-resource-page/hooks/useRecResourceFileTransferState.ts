import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import { recResourceDetailStore } from "../store/recResourceDetailStore";
import {
  addPendingDoc,
  recResourceFileTransferStore,
  removePendingDoc,
  setDocToDelete,
  setSelectedFile,
  setShowDeleteModal,
  setShowUploadOverlay,
  setUploadFileName,
  updatePendingDoc,
} from "../store/recResourceFileTransferStore";
import { GalleryAction, GalleryDocument, GalleryFile } from "../types";
import { useDownloadFileMutation } from "./useDownloadFileMutation";

/**
 * Custom React hook to manage file picker and modal UI state for file uploads and deletes.
 * All document data is managed by React Query, not the store.
 * @returns Object containing state and handlers for file picker, upload modal, and delete modal.
 */
export function useRecResourceFileTransferState() {
  const {
    selectedFileForUpload: selectedFile,
    uploadFileName,
    showUploadOverlay,
    pendingDocs,
    showDeleteModal,
    docToDelete,
  } = useStore(recResourceFileTransferStore);

  const { recResource } = useStore(recResourceDetailStore);

  const uploadResourceDocumentMutation = useUploadResourceDocument();
  const downloadMutation = useDownloadFileMutation();

  // File picker handler
  const handleAddFileClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (e: any) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setShowUploadOverlay(true);
      }
    };
    input.click();
  }, []);

  // Cancel upload and reset state
  const handleCancelUpload = useCallback(() => {
    setShowUploadOverlay(false);
    setSelectedFile(null);
    setUploadFileName("");
  }, []);

  // Shared upload logic for both new and retry uploads
  const doUpload = useCallback(
    async ({
      rec_resource_id,
      file,
      title,
      tempId,
      onSuccess,
    }: {
      rec_resource_id: string;
      file: File;
      title: string;
      tempId: string;
      onSuccess: () => void;
    }) => {
      try {
        await uploadResourceDocumentMutation.mutateAsync({
          recResourceId: rec_resource_id,
          file,
          title,
        });
        addSuccessNotification(`File "${title}" uploaded successfully.`);
        onSuccess();
        handleCancelUpload();
        removePendingDoc(tempId);
      } catch {
        addErrorNotification(
          `Failed to upload file "${title}". Please try again.`,
        );
        updatePendingDoc(tempId, {
          isUploading: false,
          uploadFailed: true,
        });
      }
    },
    [uploadResourceDocumentMutation, handleCancelUpload],
  );

  // Handle upload (with pending doc)
  const handleUpload = useCallback(
    async (onSuccess: () => void) => {
      if (!selectedFile || !uploadFileName) return;
      const tempId = `pending-${Date.now()}`;
      const tempDoc: GalleryDocument = {
        id: tempId,
        name: uploadFileName,
        date: new Date().toISOString(),
        url: "",
        extension: selectedFile.name.split(".").pop()!,
        isUploading: true,
        pendingFile: selectedFile,
      };
      addPendingDoc(tempDoc);
      setShowUploadOverlay(false);
      await doUpload({
        rec_resource_id: recResource?.rec_resource_id!,
        file: selectedFile,
        title: uploadFileName,
        tempId,
        onSuccess,
      });
    },
    [selectedFile, uploadFileName, doUpload],
  );

  // Handle upload retry (for failed uploads)
  const handleUploadRetry = useCallback(
    async (pendingDoc: GalleryFile, onSuccess: () => void) => {
      if (!pendingDoc.pendingFile) {
        return;
      }
      updatePendingDoc(pendingDoc.id, {
        isUploading: true,
        uploadFailed: false,
      });
      await doUpload({
        rec_resource_id: recResource?.rec_resource_id!,
        file: pendingDoc.pendingFile,
        title: pendingDoc.name,
        tempId: pendingDoc.id,
        onSuccess,
      });
    },
    [doUpload],
  );

  // Download handler
  const handleDownload = useCallback(
    (url: string, fileName: string) => {
      downloadMutation.mutate({ url, fileName });
    },
    [downloadMutation],
  );

  // Centralized document action handler
  const handleGalleryAction = useCallback(
    (action: GalleryAction, file: GalleryFile, refetch: () => void) => {
      switch (action) {
        case "view":
          if (file && file.url) window.open(file.url, "_blank");
          break;
        case "download":
          if (file && file.url) handleDownload(file.url, file.name);
          break;
        case "retry":
          if (file) handleUploadRetry(file, refetch);
          break;
        case "delete":
          if (file) {
            setDocToDelete(file);
            setShowDeleteModal(true);
          }
          break;
        case "confirm-delete":
          if (file) {
            // Actual delete logic here
            console.log("Delete confirmed for:", file);
            // TODO: Add mutation or API call to delete document
          }
          setShowDeleteModal(false);
          setDocToDelete(undefined);
          refetch();
          break;
        case "cancel-delete":
          setShowDeleteModal(false);
          setDocToDelete(undefined);
          break;
        default:
          break;
      }
    },
    [handleDownload, handleUploadRetry],
  );

  const getUploadHandler = useCallback(
    (rec_resource_id: string, onSuccess: () => void) => {
      return async () => {
        await handleUpload(onSuccess);
      };
    },
    [handleUpload],
  );

  const getActionHandler = useCallback(
    (onSuccess: () => void) => {
      return (action: GalleryAction, file: GalleryFile) => {
        handleGalleryAction(action, file, onSuccess);
      };
    },
    [handleGalleryAction],
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
  };
}
