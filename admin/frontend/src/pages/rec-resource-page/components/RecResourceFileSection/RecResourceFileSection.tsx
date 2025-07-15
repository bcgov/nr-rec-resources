import { DeleteFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal";
import { FileUploadModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal";
import { GalleryDocument } from "@/pages/rec-resource-page/types";
import { COLOR_RED } from "@/styles/colors";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDocumentList } from "../../hooks/useDocumentList";
import { useRecResourceFileTransferState } from "../../hooks/useRecResourceFileTransferState";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryFileCard } from "./GalleryFileCard";

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
    getActionHandler,
    showDeleteModal,
    docToDelete,
  } = useRecResourceFileTransferState();

  const galleryDocuments = [...pendingDocs, ...galleryDocumentsFromServer];

  // Handlers
  const onUploadConfirmation = getUploadHandler(rec_resource_id, refetch);
  const onAction = getActionHandler(refetch);

  // Render a single document card
  const renderGalleryFileCard = (doc: GalleryDocument) => (
    <GalleryFileCard<GalleryDocument>
      key={doc.id}
      topContent={
        <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
      }
      file={doc}
      onAction={onAction}
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
      {docToDelete && (
        <DeleteFileModal
          open={showDeleteModal}
          file={docToDelete}
          onAction={onAction}
        />
      )}
    </>
  );
};
