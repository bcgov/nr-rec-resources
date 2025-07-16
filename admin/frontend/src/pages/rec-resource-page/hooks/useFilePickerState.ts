import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import {
  recResourceFileTransferStore,
  setSelectedFile,
  setShowUploadOverlay,
  setUploadFileName,
} from "../store/recResourceFileTransferStore";

/**
 * Hook to manage file picker and upload modal state.
 * Handles file selection and upload overlay visibility.
 */
export function useFilePickerState() {
  const {
    selectedFileForUpload: selectedFile,
    uploadFileName,
    showUploadOverlay,
  } = useStore(recResourceFileTransferStore);

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

  return {
    selectedFile,
    uploadFileName,
    showUploadOverlay,
    handleAddFileClick,
    handleCancelUpload,
    setUploadFileName,
  };
}
