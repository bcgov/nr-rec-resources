import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
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
import { useRecResourceFileTransferManager } from "./useRecResourceFileTransferManager";
import { formatDocumentDate } from "./helpers";
import { MAX_DOCUMENTS_PER_REC_RESOURCE } from "./constants";
import { COLOR_RED } from "@/styles/colors";

export const RecResourceFilesPage = () => {
  const { id: rec_resource_id } = useParams();
  if (!rec_resource_id) {
    return <div>Error: Recreation Resource ID is required.</div>;
  }

  const {
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
  } = useRecResourceFileTransferManager([]);

  const {
    data: documents,
    isFetching: isFetchingDocuments,
    refetch,
  } = useGetDocumentsByRecResourceId(rec_resource_id);

  const onUpload = () =>
    handleUpload({
      rec_resource_id,
      onSuccess: refetch,
    });

  const allDocuments: GalleryDocument[] = useMemo(
    () => [
      ...newUploads.map((u) => ({
        ...u,
        date: formatDocumentDate(u.date),
      })),
      ...(documents
        ? documents.map((doc) => ({
            ...doc,
            id: doc.ref_id,
            name: doc.title,
            date: doc.created_at ? formatDocumentDate(doc.created_at) : "",
          }))
        : []),
    ],
    [newUploads, documents],
  );

  /*
   * Disable upload if the maximum number of documents has been reached.
   * Exclude documents that have failed to upload
   */
  const isDocumentUploadDisabled =
    allDocuments.filter((doc) => !doc.uploadFailed).length >=
    MAX_DOCUMENTS_PER_REC_RESOURCE;

  const onDocumentAction = (action: GalleryAction, file: GalleryDocument) => {
    if (action === "view" && file.url) {
      window.open(file.url, "_blank");
    }
    if (action === "download" && file.url) {
      handleDownload(file.url, file.name || "document");
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

      {/* Document gallery */}
      <GalleryAccordion<GalleryDocument>
        eventKey="documents"
        title="Public documents"
        description="Document formats only accept PDF at max file size 1mb."
        items={allDocuments}
        uploadLabel="Upload"
        isLoading={isFetchingDocuments}
        onUploadClick={handleAddFileClick}
        uploadDisabled={isDocumentUploadDisabled}
        renderItem={(doc) => (
          <GalleryFileCard<GalleryDocument>
            key={doc.id}
            topContent={
              <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
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
