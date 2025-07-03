import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";
import { downloadUrlAsFile } from "@/utils/fileUtils";
import { Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { DocumentGallery } from "./DocumentGallery";
import { ImageGallery } from "./ImageGallery";
import { InfoBanner } from "./InfoBanner";
import "./RecResourceFilesPage.scss";
import { ResourceHeaderSection } from "./ResourceHeaderSection";
import { useState } from "react";
import { UploadFileModal } from "./UploadFileModal";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";

// Reusable file input handler
function openFilePicker(accept: string, onFile: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = (e: any) => {
    const file = e.target.files && e.target.files[0];
    if (file) onFile(file);
  };
  input.click();
}

export const RecResourceFilesPage = () => {
  const params = useParams();
  const {
    data: documents,
    isFetching,
    error,
  } = useGetDocumentsByRecResourceId(`${params.id}`);

  // todo: replace mock data with api call
  const images = Array(10).fill({
    name: "File_Name.jpg",
    date: "06 Nov 2023, 02:45 PM",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  });

  // State
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>("");

  // Upload mutation
  const uploadMutation = useUploadResourceDocument();

  // Handlers
  const handleImageUploadTileClick = () => {
    openFilePicker(".jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff", (file) => {
      setSelectedFile(file);
      setShowUploadOverlay(true);
    });
  };

  const handleDocumentUploadTileClick = () => {
    openFilePicker("application/pdf", (file) => {
      setSelectedFile(file);
      setShowUploadOverlay(true);
    });
  };

  const handleCancelUpload = () => {
    setShowUploadOverlay(false);
    setSelectedFile(null);
    setUploadTitle("");
  };

  const handleUpload = () => {
    if (!selectedFile || !params.id || !uploadTitle) return;
    uploadMutation.mutate(
      {
        recResourceId: params.id,
        file: selectedFile,
        title: uploadTitle,
      },
      {
        onSuccess: () => {
          setShowUploadOverlay(false);
          setSelectedFile(null);
          setUploadTitle("");
        },
        onError: () => {
          // Optionally show error UI
        },
      },
    );
  };

  const onImageAction = (
    action: "view" | "download" | "delete" | "add",
    file: { name: string; date: string; url: string },
  ) => {
    console.log(`${action} image:`, file);
    if (action === "download" && file.url) {
      downloadUrlAsFile(file.url, file.name || "document");
    }
  };

  const onDocumentAction = (
    action: "view" | "download" | "delete" | "add",
    file: RecreationResourceDocDto,
  ) => {
    if (action === "view" && file.url) {
      window.open(file.url, "_blank");
    }
    if (action === "download" && file.url) {
      downloadUrlAsFile(file.url, file.title || "document");
    }
    // handle 'add' and 'delete' as needed
  };

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-files-page py-4"
    >
      <ResourceHeaderSection name="Snow Creek" recId="REC2214" />
      <InfoBanner>
        All images and documents will be published to the beta website
        immediately.
      </InfoBanner>
      <ImageGallery
        images={images}
        onAction={onImageAction}
        isLoading={isFetching}
        onUploadClick={handleImageUploadTileClick}
      />
      <DocumentGallery
        documents={documents}
        onAction={onDocumentAction}
        isLoading={isFetching}
        onUploadClick={handleDocumentUploadTileClick}
      />
      <UploadFileModal
        open={showUploadOverlay && !!selectedFile}
        file={selectedFile}
        title={uploadTitle}
        onTitleChange={setUploadTitle}
        onCancel={handleCancelUpload}
        onUpload={handleUpload}
      />
      {uploadMutation.isPending && (
        <div className="text-info">Uploading...</div>
      )}
      {uploadMutation.isError && (
        <div className="text-danger">Upload failed. Please try again.</div>
      )}
    </Stack>
  );
};
