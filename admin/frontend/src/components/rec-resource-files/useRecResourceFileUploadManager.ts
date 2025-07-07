import { useState, useCallback } from "react";
import { GalleryDocument } from "./types";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import {
  addSuccessNotification,
  addErrorNotification,
} from "@/store/notificationStore";

/**
 * Custom React hook to manage file uploads for a recreation resource.
 * Handles file selection, upload overlay state, and pending uploads.
 *
 * @param initial - Initial list of GalleryDocument objects to populate pending uploads.
 * @returns Object containing state and handlers for file upload management.
 */
export function useRecResourceFileUploadManager(
  initial: GalleryDocument[] = [],
) {
  /**
   * State for documents currently pending upload.
   */
  const [pendingUploads, setPendingUploads] =
    useState<GalleryDocument[]>(initial);
  /**
   * currently selected file to upload.
   */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  /**
   * title of the file being uploaded.
   */
  const [uploadTitle, setUploadTitle] = useState<string>("");
  /**
   * controls visibility of the upload overlay/modal.
   */
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  /**
   * Mutation hook for uploading a resource document.
   */
  const uploadMutation = useUploadResourceDocument();

  /**
   * Handler for the 'Add File' button click. Opens a file picker for PDF files.
   */
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

  /**
   * Handler to cancel the upload process and reset related state.
   */
  const handleCancelUpload = useCallback(() => {
    setShowUploadOverlay(false);
    setSelectedFile(null);
    setUploadTitle("");
  }, []);

  /**
   * Handler to perform the file upload. Adds a pending upload, calls the upload mutation, and handles notifications.
   *
   * @param params.rec_resource_id - The ID of the recreation resource.
   * @param params.onSuccess - Callback to run after successful upload.
   */
  const handleUpload = useCallback(
    ({
      rec_resource_id,
      onSuccess,
    }: {
      rec_resource_id: string;
      onSuccess: () => void;
    }) => {
      if (!selectedFile || !uploadTitle) return;
      const tempId = `${Date.now()}-${Math.random()}`;

      // Add a temporary entry to pending uploads
      setPendingUploads((prev) => [
        ...prev,
        {
          id: tempId,
          name: uploadTitle,
          rec_resource_id,
          url: "",
          doc_code: "RM",
          doc_code_description: "Pending Upload",
          extension: selectedFile.name.split(".").pop() || "",
          date: new Date().toISOString(),
          isUploading: true,
        },
      ]);
      setShowUploadOverlay(false);
      setSelectedFile(null);
      setUploadTitle("");
      uploadMutation.mutate(
        {
          recResourceId: rec_resource_id,
          file: selectedFile,
          title: uploadTitle,
        },
        {
          onSuccess: () => {
            addSuccessNotification("Document uploaded successfully.");
            onSuccess();
          },
          onError: () => {
            addErrorNotification("Failed to upload document.", "error");
          },
          onSettled: () => {
            // Remove the pending upload entry
            setPendingUploads((prev) => prev.filter((u) => u.id !== tempId));
          },
        },
      );
    },
    [selectedFile, uploadTitle, uploadMutation],
  );

  return {
    pendingUploads,
    selectedFile,
    uploadTitle,
    showUploadOverlay,
    handleAddFileClick,
    handleCancelUpload,
    handleUpload,
    setUploadTitle,
  };
}
