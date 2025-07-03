import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { downloadUrlAsFile } from "@/utils/fileUtils";
import { Stack, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { DocumentGallery } from "./DocumentGallery";
import { ImageGallery } from "./ImageGallery";
import { InfoBanner } from "./InfoBanner";
import "./RecResourceFilesPage.scss";
import { ResourceHeaderSection } from "./ResourceHeaderSection";
import { useState } from "react";
import { UploadFileModal } from "./UploadFileModal";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import { GalleryImage, GalleryDocument, GalleryFile } from "./types";

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
  const [pendingImageUploads, setPendingImageUploads] = useState<
    GalleryImage[]
  >([]);
  const [pendingDocumentUploads, setPendingDocumentUploads] = useState<
    GalleryDocument[]
  >([
    // todo: remove mock data
    {
      id: "1",
      name: "Pending Document",
      url: "",
      extension: "",
      date: new Date().toISOString(),
      isUploading: true,
      rec_resource_id: "",
    },
    {
      id: "1",
      name: "Pending Document",
      url: "",
      extension: "",
      date: new Date().toISOString(),
      isUploading: true,
      uploadFailed: true,
      rec_resource_id: "",
    },
  ]);

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
    const tempId = `${Date.now()}-${Math.random()}`;
    const isImage = /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(
      selectedFile.name,
    );
    if (isImage) {
      setPendingImageUploads((prev) => [
        ...prev,
        {
          id: tempId,
          name: uploadTitle,
          rec_resource_id: params.id!,
          url: URL.createObjectURL(selectedFile),
          extension: selectedFile.name.split(".").pop() || "",
          date: new Date().toISOString(),
          isUploading: true,
        },
      ]);
    } else {
      setPendingDocumentUploads((prev) => [
        ...prev,
        {
          id: tempId,
          name: uploadTitle,
          rec_resource_id: params.id!,
          url: "",
          doc_code: "RM",
          doc_code_description: "Pending Upload",
          extension: selectedFile.name.split(".").pop() || "",
          date: new Date().toISOString(),
          isUploading: true,
        },
      ]);
    }
    setShowUploadOverlay(false); // Close modal immediately
    setSelectedFile(null);
    setUploadTitle("");
    uploadMutation.mutate(
      {
        recResourceId: params.id,
        file: selectedFile,
        title: uploadTitle,
      },
      {
        onSuccess: (data) => {
          setPendingImageUploads((prev) => prev.filter((u) => u.id !== tempId));
          setPendingDocumentUploads((prev) =>
            prev.filter((u) => u.id !== tempId),
          );
        },
        onError: () => {
          setPendingImageUploads((prev) => prev.filter((u) => u.id !== tempId));
          setPendingDocumentUploads((prev) =>
            prev.filter((u) => u.id !== tempId),
          );
        },
      },
    );
  };

  const pendingImages: GalleryFile[] = pendingImageUploads
    .filter((u) => u.url && u.isUploading)
    .map(
      (u): GalleryImage => ({
        id: u.id,
        name: u.name,
        date: new Date(u.date).toLocaleString("en-CA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        url: u.url,
        isUploading: u.isUploading,
        uploadFailed: u.uploadFailed,
        extension: u.extension,
        rec_resource_id: "",
      }),
    );
  const allImages: GalleryImage[] = [...pendingImages, ...images];

  const allDocuments: GalleryDocument[] = [
    ...pendingDocumentUploads
      .filter((u) => !u.url && u.isUploading)
      .map(
        (u): GalleryDocument => ({
          id: u.id,
          name: u.name,
          date: new Date(u.date).toLocaleString("en-CA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          url: "", // or u.url if available
          isUploading: u.isUploading,
          uploadFailed: u.uploadFailed,
          extension: u.extension,
          rec_resource_id: "",
        }),
      ),
    ...(documents
      ? documents.map(
          (doc): GalleryDocument => ({
            id: doc.ref_id,
            name: doc.title,
            date: doc.created_at
              ? new Date(doc.created_at).toLocaleString("en-CA", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "",
            url: doc.url || "",
            isUploading: (doc as any).isUploading,
            uploadFailed: (doc as any).uploadFailed,
            doc_code: doc.doc_code,
            doc_code_description: doc.doc_code_description,
            rec_resource_id: doc.rec_resource_id,
            extension: doc.extension,
          }),
        )
      : []),
  ];

  const onImageAction = (
    action: "view" | "download" | "delete" | "add",
    file: GalleryImage,
  ) => {
    console.log(`${action} image:`, file);
    if (action === "download" && file.url) {
      downloadUrlAsFile(file.url, file.name || "document");
    }
  };

  const onDocumentAction = (
    action: "view" | "download" | "delete" | "add",
    file: GalleryDocument,
  ) => {
    if (action === "view" && file.url) {
      window.open(file.url, "_blank");
    }
    if (action === "download" && file.url) {
      downloadUrlAsFile(file.url, file.name || "document");
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
        images={allImages}
        onAction={onImageAction}
        isLoading={isFetching}
        onUploadClick={handleImageUploadTileClick}
      />
      <DocumentGallery
        documents={allDocuments}
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
