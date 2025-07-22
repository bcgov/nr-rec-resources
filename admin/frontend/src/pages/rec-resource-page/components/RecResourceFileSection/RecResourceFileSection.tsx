import { DeleteFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal";
import { FileUploadModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal";
import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { GalleryDocument } from "@/pages/rec-resource-page/types";
import { COLOR_RED } from "@/styles/colors";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryFileCard } from "./GalleryFileCard";

export const RecResourceFileSection = () => {
  const {
    getDocumentFileActionHandler,
    getDocumentGeneralActionHandler,
    galleryDocuments,
    isDocumentUploadDisabled,
    isFetching,
  } = useRecResourceFileTransferState();

  // Render a single document card
  const renderGalleryFileCard = (doc: GalleryDocument) => (
    <GalleryFileCard<GalleryDocument>
      key={doc.id}
      topContent={
        <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
      }
      file={doc}
      getFileActionHandler={getDocumentFileActionHandler}
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
        onFileUploadTileClick={getDocumentGeneralActionHandler("upload")}
        uploadDisabled={isDocumentUploadDisabled}
        renderItem={renderGalleryFileCard}
      />

      <FileUploadModal />
      <DeleteFileModal />
    </>
  );
};
