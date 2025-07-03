import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import { showNotification } from "@/store/notificationStore";
import { downloadUrlAsFile } from "@/utils/fileUtils";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import { Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryFileCard } from "./GalleryFileCard";
import { InfoBanner } from "./InfoBanner";
import "./RecResourceFilesPage.scss";
import { ResourceHeaderSection } from "./ResourceHeaderSection";
import { GalleryAction, GalleryDocument } from "./types";
import { UploadFileModal } from "./UploadFileModal";

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
  const { data: documents, isFetching } = useGetDocumentsByRecResourceId(
    `${params.id}`,
  );

  // todo: replace mock data with api call

  // State
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>("");
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

    // Validate document (PDF)
    if (selectedFile.type !== "application/pdf") {
      showNotification("Only PDF documents are allowed.");
      return;
    }

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
        onSuccess: () => {
          setPendingDocumentUploads((prev) =>
            prev.filter((u) => u.id !== tempId),
          );
        },
        onError: () => {
          setPendingDocumentUploads((prev) =>
            prev.filter((u) => u.id !== tempId),
          );
        },
      },
    );
  };

  // Memoize gallery data to avoid unnecessary recalculations

  const allDocuments: GalleryDocument[] = useMemo(
    () => [
      ...pendingDocumentUploads
        .filter((u) => !u.url && u.isUploading)
        .map((u) => ({
          ...u,
          date: new Date(u.date).toLocaleString("en-CA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        })),
      ...(documents
        ? documents.map((doc) => ({
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
          }))
        : []),
    ],
    [pendingDocumentUploads, documents],
  );

  const onDocumentAction = (action: GalleryAction, file: GalleryDocument) => {
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
      <GalleryAccordion<GalleryDocument>
        eventKey="documents"
        title="Public documents"
        description="Document formats only accept PDF at max file size 1mb."
        items={allDocuments}
        uploadLabel="Upload"
        isLoading={isFetching}
        onUploadClick={handleDocumentUploadTileClick}
        renderItem={(doc) => (
          <GalleryFileCard<GalleryDocument>
            key={doc.id}
            topContent={
              <FontAwesomeIcon icon={faFilePdf} size="2x" color="#d32f2f" />
            }
            file={doc}
            onAction={onDocumentAction}
          />
        )}
      />
      <UploadFileModal
        open={showUploadOverlay && !!selectedFile}
        file={selectedFile}
        title={uploadTitle}
        onTitleChange={setUploadTitle}
        onCancel={handleCancelUpload}
        onUpload={handleUpload}
      />
    </Stack>
  );
};
