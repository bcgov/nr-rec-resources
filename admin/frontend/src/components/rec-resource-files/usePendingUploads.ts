import { useState, useCallback } from "react";
import { GalleryDocument } from "./types";

export function usePendingUploads(initial: GalleryDocument[] = []) {
  const [pendingUploads, setPendingUploads] =
    useState<GalleryDocument[]>(initial);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  const addPendingUpload = useCallback((doc: GalleryDocument) => {
    setPendingUploads((prev) => [...prev, doc]);
  }, []);

  const removePendingUpload = useCallback((id: string) => {
    setPendingUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const resetPendingUploads = useCallback(() => {
    setPendingUploads([]);
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
      uploadMutation,
      showNotification,
      refetch,
    }: {
      rec_resource_id: string;
      uploadMutation: any;
      showNotification: (msg: string) => void;
      refetch: () => void;
    }) => {
      if (!selectedFile || !uploadTitle) return;
      const tempId = `${Date.now()}-${Math.random()}`;
      if (selectedFile.type !== "application/pdf") {
        showNotification("Only PDF documents are allowed.");
        return;
      }
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
            refetch();
          },
          onError: () => {
            removePendingUpload(tempId);
          },
        },
      );
    },
    [selectedFile, uploadTitle, addPendingUpload, removePendingUpload],
  );

  return {
    pendingUploads,
    setPendingUploads,
    addPendingUpload,
    removePendingUpload,
    resetPendingUploads,
    selectedFile,
    setSelectedFile,
    uploadTitle,
    setUploadTitle,
    showUploadOverlay,
    setShowUploadOverlay,
    handleDocumentUploadTileClick,
    handleCancelUpload,
    handleUpload,
  };
}
