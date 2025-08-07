import { DeleteFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal";
import { FileUploadModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal";
import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { resetRecResourceFileTransferStore } from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { GalleryDocument, GalleryImage } from "@/pages/rec-resource-page/types";
import { COLOR_RED } from "@/styles/colors";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryFileCard } from "./GalleryFileCard";

export const RecResourceFileSection = () => {
  const {
    getDocumentFileActionHandler,
    getDocumentGeneralActionHandler,
    getImageFileActionHandler,
    getImageGeneralActionHandler,
    galleryDocuments,
    galleryImages,
    isDocumentUploadDisabled,
    isImageUploadDisabled,
    isFetching,
    isFetchingImages,
  } = useRecResourceFileTransferState();

  // reset the store on unmount
  useEffect(() => {
    return () => {
      resetRecResourceFileTransferStore();
    };
  }, []);

  // Render a single document card
  const renderGalleryDocumentCard = (doc: GalleryDocument) => (
    <GalleryFileCard<GalleryDocument>
      key={doc.id}
      topContent={
        <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
      }
      file={doc}
      getFileActionHandler={getDocumentFileActionHandler}
    />
  );

  // Render a single image card
  const renderGalleryImageCard = (image: GalleryImage) => (
    <GalleryFileCard<GalleryImage>
      key={image.id}
      topContent={<img src={image.previewUrl} alt={image.name} />}
      file={image}
      getFileActionHandler={getImageFileActionHandler}
    />
  );

  return (
    <>
      <GalleryAccordion<GalleryImage>
        eventKey="images"
        title="Public images"
        description="Upload up to 20 JPG, PNG, or WEBP images (max 10MB each)."
        items={galleryImages}
        uploadLabel="Upload"
        isLoading={isFetchingImages}
        onFileUploadTileClick={getImageGeneralActionHandler("upload")}
        uploadDisabled={isImageUploadDisabled}
        renderItem={renderGalleryImageCard}
      />
      <GalleryAccordion<GalleryDocument>
        eventKey="documents"
        title="Public documents"
        description="Documents are only accepted in PDF format with a 20MB file size limit. Maximum 30 documents."
        items={galleryDocuments}
        uploadLabel="Upload"
        isLoading={isFetching}
        onFileUploadTileClick={getDocumentGeneralActionHandler("upload")}
        uploadDisabled={isDocumentUploadDisabled}
        renderItem={renderGalleryDocumentCard}
      />

      <FileUploadModal />
      <DeleteFileModal />
    </>
  );
};
