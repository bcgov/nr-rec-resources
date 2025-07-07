import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { GalleryDocument } from "./types";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import { downloadUrlAsFile } from "@/utils/fileUtils";
import {
  addSuccessNotification,
  addErrorNotification,
} from "@/store/notificationStore";

/**
 * Custom React hook to manage file uploads and downloads for a recreation resource.
 * Handles file selection, upload overlay state, pending uploads, and download state.
 *
 * @param initial - Initial list of GalleryDocument objects to populate pending uploads.
 * @returns Object containing state and handlers for file upload and download management.
 */
export function useRecResourceFileTransferManager(
  initial: GalleryDocument[] = [],
) {
  /**
   * State for documents currently pending upload.
   */
  const [newUploads, setNewUploads] = useState<GalleryDocument[]>(initial);
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

  const uploadMutation = useUploadResourceDocument();

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

  const handleCancelUpload = useCallback(() => {
    setShowUploadOverlay(false);
    setSelectedFile(null);
    setUploadTitle("");
  }, []);

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
      const tempEntry: GalleryDocument = {
        id: tempId,
        name: uploadTitle,
        rec_resource_id,
        url: "",
        doc_code: "RM",
        doc_code_description: "Pending Upload",
        extension: selectedFile.name.split(".").pop() || "",
        date: new Date().toISOString(),
        isUploading: true,
      };
      setNewUploads((prev) => [...prev, tempEntry]);
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
            setNewUploads((prev) => prev.filter((u) => u.id !== tempId));
            onSuccess();
          },
          onError: () => {
            addErrorNotification("Failed to upload document.", "error");
            tempEntry.isUploading = false;
            tempEntry.uploadFailed = true;
            setNewUploads((prev) => [...prev]);
          },
        },
      );
    },
    [selectedFile, uploadTitle, uploadMutation],
  );

  // Download mutation logic
  const downloadMutation = useMutation<
    void,
    unknown,
    { url: string; fileName: string }
  >({
    mutationFn: async ({ url, fileName }) => {
      await downloadUrlAsFile(url, fileName || "document");
    },
    onSuccess: (_data, variables) => {
      addSuccessNotification(
        `File "${variables.fileName}" downloaded successfully.`,
      );
    },
    onError: (error, variables) => {
      console.error("Failed to download file:", error);
      addErrorNotification(`Failed to download file "${variables.fileName}".`);
    },
  });

  const handleDownload = useCallback(
    (url: string, fileName: string) => {
      downloadMutation.mutate({ url, fileName });
    },
    [downloadMutation],
  );

  return {
    newUploads,
    selectedFile,
    uploadTitle,
    showUploadOverlay,
    handleAddFileClick,
    handleCancelUpload,
    handleUpload,
    setUploadTitle,
    handleDownload,
    downloadMutation,
  };
}
