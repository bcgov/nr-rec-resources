import { useState, useCallback } from "react";
import { GalleryDocument } from "./types";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import {
  addSuccessNotification,
  addErrorNotification,
} from "@/store/notificationStore";

export function usePendingUploads(initial: GalleryDocument[] = []) {
  const [pendingUploads, setPendingUploads] =
    useState<GalleryDocument[]>(initial);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  // Move uploadMutation inside the hook
  const uploadMutation = useUploadResourceDocument();

  const addPendingUpload = useCallback((doc: GalleryDocument) => {
    setPendingUploads((prev) => [...prev, doc]);
  }, []);

  const removePendingUpload = useCallback((id: string) => {
    setPendingUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const handleDocumentUploadTileClick = useCallback(() => {
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

  // Upload handler encapsulated in the hook
  const handleUpload = useCallback(
    ({
      rec_resource_id,
      refetch,
    }: {
      rec_resource_id: string;
      refetch: () => void;
    }) => {
      if (!selectedFile || !uploadTitle) return;
      const tempId = `${Date.now()}-${Math.random()}`;
      addPendingUpload({
        id: tempId,
        name: uploadTitle,
        rec_resource_id,
        url: "",
        doc_code: "RM",
        doc_code_description: "Pending Upload",
        extension: selectedFile.name.split(".").pop() || "",
        date: new Date().toISOString(),
        isUploading: true,
      });
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
            removePendingUpload(tempId);

            addSuccessNotification("Document uploaded successfully.");
            refetch();
          },
          onError: () => {
            removePendingUpload(tempId);
            addErrorNotification("Failed to upload document.", "error");
          },
        },
      );
    },
    [
      selectedFile,
      uploadTitle,
      addPendingUpload,
      removePendingUpload,
      uploadMutation,
    ],
  );

  return {
    pendingUploads,
    selectedFile,
    uploadTitle,
    showUploadOverlay,
    handleDocumentUploadTileClick,
    handleCancelUpload,
    handleUpload,
    setUploadTitle,
  };
}
