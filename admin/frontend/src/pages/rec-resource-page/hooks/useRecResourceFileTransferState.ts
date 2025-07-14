import { useCallback } from "react";
import {
  recResourceFileTransferStore,
  setSelectedFile,
  setUploadFileName,
  setShowUploadOverlay,
  addPendingDoc,
  removePendingDoc,
  updatePendingDoc,
} from "../store/recResourceFileTransferStore";
import { useStore } from "@tanstack/react-store";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import { GalleryAction, GalleryDocument } from "../types";
import { useDownloadFileMutation } from "./useDownloadFileMutation";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";

/**
 * Custom React hook to manage file picker and modal UI state for file uploads.
 * All document data is managed by React Query, not the store.
 * @returns Object containing state and handlers for file picker and modal.
 */
export function useRecResourceFileTransferState() {
  const {
    selectedFileForUpload: selectedFile,
    uploadFileName,
    showUploadOverlay,
    pendingDocs,
  } = useStore(recResourceFileTransferStore);

  const uploadResourceDocumentMutation = useUploadResourceDocument();

  // Open file picker for PDF
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
    async (rec_resource_id: string, onSuccess: () => void) => {
      if (!selectedFile || !uploadFileName) return;
      const tempId = `pending-${Date.now()}`;
      const tempDoc: GalleryDocument = {
        id: tempId,
        name: uploadFileName,
        date: new Date().toISOString(),
        url: "",
        extension: selectedFile.name.split(".").pop()!,
        isUploading: true,
        rec_resource_id,
        pendingFile: selectedFile,
      };
      addPendingDoc(tempDoc);
      setShowUploadOverlay(false);
      await doUpload({
        rec_resource_id,
        file: selectedFile,
        title: uploadFileName,
        tempId,
        onSuccess,
      });
    },
    [selectedFile, uploadFileName, doUpload],
  );

  // Handle upload retry (for failed uploads, if needed)
  const handleUploadRetry = useCallback(
    async (pendingDoc: GalleryDocument, onSuccess: () => void) => {
      if (!pendingDoc.pendingFile) {
        return;
      }
      updatePendingDoc(pendingDoc.id, {
        isUploading: true,
        uploadFailed: false,
      });
      await doUpload({
        rec_resource_id: pendingDoc.rec_resource_id,
        file: pendingDoc.pendingFile,
        title: pendingDoc.name,
        tempId: pendingDoc.id,
        onSuccess,
      });
    },
    [doUpload],
  );

  // Download mutation logic
  const downloadMutation = useDownloadFileMutation();

  const handleDownload = useCallback(
    (url: string, fileName: string) => {
      downloadMutation.mutate({ url, fileName });
    },
    [downloadMutation],
  );

  // Handles all document actions (view, download, retry)
  const handleDocumentAction = useCallback(
    (action: GalleryAction, file: GalleryDocument, refetch: () => void) => {
      if (action === "view" && file.url) {
        window.open(file.url, "_blank");
      }
      if (action === "download" && file.url) {
        handleDownload(file.url, file.name);
      }
      if (action === "retry") {
        handleUploadRetry(file, refetch);
      }
    },
    [handleDownload, handleUploadRetry],
  );

  const getUploadHandler = useCallback(
    (rec_resource_id: string, onSuccess: () => void) => {
      return async () => {
        await handleUpload(rec_resource_id, onSuccess);
      };
    },
    [handleUpload],
  );

  const getDocumentActionHandler = useCallback(
    (onSuccess: () => void) => {
      return (action: GalleryAction, file: GalleryDocument) => {
        handleDocumentAction(action, file, onSuccess);
      };
    },
    [handleDocumentAction],
  );

  return {
    selectedFile,
    uploadFileName,
    showUploadOverlay,
    pendingDocs,
    handleAddFileClick,
    handleCancelUpload,
    setUploadFileName,
    getUploadHandler,
    getDocumentActionHandler,
  };
}
