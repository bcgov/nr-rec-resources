import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { downloadUrlAsFile } from "@/utils/fileUtils";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import { Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryFileCard } from "./GalleryFileCard";
import { InfoBanner } from "./InfoBanner";
import "./RecResourceFilesPage.scss";
import { ResourceHeaderSection } from "./ResourceHeaderSection";
import { GalleryAction, GalleryDocument } from "./types";
import { UploadFileModal } from "./UploadFileModal";
import { useRecResourceFileUploadManager } from "./useRecResourceFileUploadManager";
import { formatDocumentDate } from "./helpers";
import {
  addErrorNotification,
  addNotification,
  addSuccessNotification,
} from "@/store/notificationStore";

export const RecResourceFilesPage = () => {
  const { id: rec_resource_id } = useParams();
  if (!rec_resource_id) {
    return <div>Error: Recreation Resource ID is required.</div>;
  }

  const {
    pendingUploads,
    selectedFile,
    uploadTitle,
    showUploadOverlay,
    handleAddFileClick,
    handleCancelUpload,
    handleUpload,
    setUploadTitle,
  } = useRecResourceFileUploadManager([]);

  const {
    data: documents,
    isFetching,
    refetch,
  } = useGetDocumentsByRecResourceId(rec_resource_id);

  const onUpload = () =>
    handleUpload({
      rec_resource_id,
      refetch,
    });

  const allDocuments: GalleryDocument[] = useMemo(
    () => [
      ...pendingUploads
        .filter((u) => !u.url && u.isUploading)
        .map((u) => ({
          ...u,
          date: formatDocumentDate(u.date),
        })),
      ...(documents
        ? documents.map((doc) => ({
            id: doc.ref_id,
            name: doc.title,
            date: doc.created_at ? formatDocumentDate(doc.created_at) : "",
            url: doc.url,
            doc_code: doc.doc_code,
            doc_code_description: doc.doc_code_description,
            rec_resource_id: doc.rec_resource_id,
            extension: doc.extension,
          }))
        : []),
    ],
    [pendingUploads, documents],
  );

  const onDocumentAction = (action: GalleryAction, file: GalleryDocument) => {
    if (action === "view" && file.url) {
      window.open(file.url, "_blank");
    }
    if (action === "download" && file.url) {
      downloadUrlAsFile(file.url, file.name || "document")
        .then(() => {
          addSuccessNotification(
            `File "${file.name}" downloaded successfully.`,
          );
        })
        .catch((error) => {
          console.error("Failed to download file:", error);
          addErrorNotification(`Failed to download file "${file.name}".`);
        });
    }
  };

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-files-page py-4"
    >
      <ResourceHeaderSection
        name="Snow Creek"
        recId="REC2214"
        onAddDocument={handleAddFileClick}
      />
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
        onUploadClick={handleAddFileClick}
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
        onUpload={onUpload}
      />
    </Stack>
  );
};
