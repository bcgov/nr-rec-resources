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
    handleCancelUpload,
    setUploadFileName,
  };
}
