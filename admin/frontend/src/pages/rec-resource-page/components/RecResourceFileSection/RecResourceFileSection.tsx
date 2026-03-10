import { FILE_TYPE_CONFIGS, MAX_FILE_SIZE_MB } from '@/pages/rec-resource-page';
import { processSelectedFile } from '@/pages/rec-resource-page/helpers';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { DeleteFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal';
import { DocumentUploadModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/DocumentUploadModal';
import { ImageUploadModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal';
import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import {
  hideImageLightbox,
  recResourceFileTransferStore,
  resetRecResourceFileTransferStore,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryDocument, GalleryImage } from '@/pages/rec-resource-page/types';
import { COLOR_RED } from '@/styles/colors';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStore } from '@tanstack/react-store';
import { useEffect } from 'react';
import { GalleryAccordion } from './GalleryAccordion';
import { GalleryFileCard } from './GalleryFileCard';
import {
  DOCUMENT_VIEWER_CARD_ACTIONS,
  IMAGE_CARD_ACTIONS,
  IMAGE_PREVIEW_ACTIONS,
  IMAGE_VIEWER_CARD_ACTIONS,
  IMAGE_VIEWER_PREVIEW_ACTIONS,
} from './GalleryFileCard/constants';
import { ImageLightboxModal } from './ImageLightboxModal';
import { PhotoDetailsModal } from './PhotoDetailsModal';
import { EditPhotoModal } from './EditPhotoModal';

export const RecResourceFileSection = () => {
  const { canEdit } = useAuthorizations();
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

  const { showImageLightbox, selectedImageForLightbox } = useStore(
    recResourceFileTransferStore,
  );

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
      actions={canEdit ? undefined : DOCUMENT_VIEWER_CARD_ACTIONS}
    />
  );

  // Render a single image card
  const renderGalleryImageCard = (image: GalleryImage) => (
    <GalleryFileCard<GalleryImage>
      key={image.id}
      topContent={<img src={image.previewUrl} alt={image.name} />}
      file={image}
      getFileActionHandler={getImageFileActionHandler}
      actions={canEdit ? IMAGE_CARD_ACTIONS : IMAGE_VIEWER_CARD_ACTIONS}
      previewActions={
        canEdit ? IMAGE_PREVIEW_ACTIONS : IMAGE_VIEWER_PREVIEW_ACTIONS
      }
    />
  );

  return (
    <>
      <GalleryAccordion<GalleryImage>
        eventKey="images"
        title="Public images"
        description={`Upload up to ${FILE_TYPE_CONFIGS.image.maxFiles} JPG, PNG, or WEBP images (max ${MAX_FILE_SIZE_MB.image}MB each).`}
        items={galleryImages}
        uploadLabel="Upload"
        isLoading={isFetchingImages}
        onFileUploadTileClick={
          canEdit ? getImageGeneralActionHandler('upload') : undefined
        }
        onFileDrop={
          canEdit ? (file) => processSelectedFile(file, 'image') : undefined
        }
        uploadDisabled={!canEdit || isImageUploadDisabled}
        showInfoBanner={canEdit}
        renderItem={renderGalleryImageCard}
      />
      <GalleryAccordion<GalleryDocument>
        eventKey="documents"
        title="Public documents"
        description={`Documents are only accepted in PDF format with a ${MAX_FILE_SIZE_MB.document}MB file size limit. Maximum ${FILE_TYPE_CONFIGS.document.maxFiles} documents.`}
        items={galleryDocuments}
        uploadLabel="Upload"
        isLoading={isFetching}
        onFileUploadTileClick={
          canEdit ? getDocumentGeneralActionHandler('upload') : undefined
        }
        onFileDrop={
          canEdit ? (file) => processSelectedFile(file, 'document') : undefined
        }
        uploadDisabled={!canEdit || isDocumentUploadDisabled}
        showInfoBanner={canEdit}
        renderItem={renderGalleryDocumentCard}
      />

      <DocumentUploadModal />
      <ImageUploadModal />
      <DeleteFileModal />
      <PhotoDetailsModal />
      <EditPhotoModal />
      <ImageLightboxModal
        show={showImageLightbox}
        onHide={hideImageLightbox}
        image={selectedImageForLightbox}
      />
    </>
  );
};
