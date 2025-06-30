import { useDocumentList } from "../../hooks/useDocumentList";
import { useRecResourceFileTransferState } from "../../hooks/useRecResourceFileTransferState";
import { FileUploadModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal";
import { GalleryDocument } from "@/pages/rec-resource-page/types";
import { GalleryFileCard } from "./GalleryFileCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { COLOR_RED } from "@/styles/colors";
import { GalleryAccordion } from "./GalleryAccordion";

interface RecResourceFileSectionProps {
  rec_resource_id: string;
}

export const RecResourceFileSection = ({
  rec_resource_id,
}: RecResourceFileSectionProps) => {
  const {
    documents: galleryDocumentsFromServer,
    isDocumentUploadDisabled,
    isFetching,
    refetch,
  } = useDocumentList(rec_resource_id);

  const {
    selectedFile,
    uploadFileName,
    showUploadOverlay,
    pendingDocs,
    handleAddFileClick,
    handleCancelUpload,
    setUploadFileName,
    getUploadHandler,
    getDocumentActionHandler,
  } = useRecResourceFileTransferState();

  const galleryDocuments = [...pendingDocs, ...galleryDocumentsFromServer];

  // Handlers
  const onUploadConfirmation = getUploadHandler(rec_resource_id, refetch);
  const onDocumentAction = getDocumentActionHandler(refetch);

  // Render a single document card
  const renderGalleryFileCard = (doc: GalleryDocument) => (
    <GalleryFileCard<GalleryDocument>
      key={doc.id}
      topContent={
        <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
      }
      file={doc}
      onAction={onDocumentAction}
    />
  );

  return (
    <>
      <GalleryAccordion<GalleryDocument>
        eventKey="documents"
        title="Public documents"
        description="Document formats only accept PDF at max file size 1mb."
        items={galleryDocuments}
        uploadLabel="Upload"
        isLoading={isFetching}
        onFileUploadTileClick={handleAddFileClick}
        uploadDisabled={isDocumentUploadDisabled}
        renderItem={renderGalleryFileCard}
      />
      <FileUploadModal
        open={showUploadOverlay && !!selectedFile}
        file={selectedFile}
        fileName={uploadFileName}
        onFileNameChange={setUploadFileName}
        onCancel={handleCancelUpload}
        onUploadConfirmation={onUploadConfirmation}
      />
    </>
  );
};
