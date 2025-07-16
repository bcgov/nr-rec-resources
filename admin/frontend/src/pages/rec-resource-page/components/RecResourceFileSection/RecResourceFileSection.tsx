import { DeleteFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal";
import { FileUploadModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal";
import { GalleryDocument } from "@/pages/rec-resource-page/types";
import { COLOR_RED } from "@/styles/colors";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRecResourceFileTransferState } from "../../hooks/useRecResourceFileTransferState";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryFileCard } from "./GalleryFileCard";

export const RecResourceFileSection = () => {
  const {
    getActionHandler,
    showDeleteModal,
    docToDelete,
    galleryDocuments,
    isDocumentUploadDisabled,
    isFetching,
    refetch,
    uploadModalState,
  } = useRecResourceFileTransferState();

  // Handlers
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
        onFileUploadTileClick={() => onAction("upload", {} as GalleryDocument)}
        uploadDisabled={isDocumentUploadDisabled}
        renderItem={renderGalleryFileCard}
      />
      {/* Upload modal from gallery actions */}
      <FileUploadModal
        open={
          uploadModalState.showUploadModal && !!uploadModalState.selectedFile
        }
        file={uploadModalState.selectedFile}
        fileName={uploadModalState.uploadFileName}
        onFileNameChange={uploadModalState.setUploadFileName}
        onCancel={() => onAction("cancel-upload", {} as GalleryDocument)}
        onUploadConfirmation={() =>
          onAction("confirm-upload", {} as GalleryDocument)
        }
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
