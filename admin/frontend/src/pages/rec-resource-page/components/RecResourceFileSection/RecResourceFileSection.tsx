import { FILE_TYPE_CONFIGS, MAX_FILE_SIZE_MB } from '@/pages/rec-resource-page';
import { processSelectedFile } from '@/pages/rec-resource-page/helpers';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { DeleteFileModal } from '@/components/delete-confirmation-modal/DeleteFileModal';
import { DocumentUploadModal } from '@/components/file/DocumentUploadModal';
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
import { GalleryFileCard } from './GalleryFileCard';
import {
  DOCUMENT_VIEWER_CARD_ACTIONS,
  IMAGE_CARD_ACTIONS,
  IMAGE_PREVIEW_ACTIONS,
  IMAGE_VIEWER_CARD_ACTIONS,
  IMAGE_VIEWER_PREVIEW_ACTIONS,
  MAX_FILES_REACHED_MESSAGE,
} from './GalleryFileCard/constants';
import { ImageLightboxModal } from './ImageLightboxModal';
import { PhotoDetailsModal } from './PhotoDetailsModal';
import { EditPhotoModal } from './EditPhotoModal';
import { GalleryAccordion } from '@/components/file/GalleryAccordion';

export const RecResourceFileSection = ({
  isArchived = false,
}: {
  isArchived?: boolean;
}) => {
  const { canEdit, canEditArchived } = useAuthorizations();
  const canModifyFiles = canEdit && (!isArchived || canEditArchived);
  const {
    getDocumentFileActionHandler,
    getDocumentGeneralActionHandler,
    getImageFileActionHandler,
    getImageGeneralActionHandler,
    galleryDocuments,
    galleryImages,
    isDocumentMaxFilesReached,
    isDocumentUploadDisabled,
    isImageMaxFilesReached,
    isImageUploadDisabled,
    isFetching,
    isFetchingImages,
    deleteModalState,
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
      actions={canModifyFiles ? undefined : DOCUMENT_VIEWER_CARD_ACTIONS}
    />
  );

  // Render a single image card
  const renderGalleryImageCard = (image: GalleryImage) => (
    <GalleryFileCard<GalleryImage>
      key={image.id}
      topContent={<img src={image.previewUrl} alt={image.name} />}
      file={image}
      getFileActionHandler={getImageFileActionHandler}
      actions={canModifyFiles ? IMAGE_CARD_ACTIONS : IMAGE_VIEWER_CARD_ACTIONS}
      previewActions={
        canModifyFiles ? IMAGE_PREVIEW_ACTIONS : IMAGE_VIEWER_PREVIEW_ACTIONS
      }
    />
  );

  return (
    <>
      <GalleryAccordion<GalleryImage>
        eventKey="images"
        title="Public images"
        description={
          isImageMaxFilesReached
            ? MAX_FILES_REACHED_MESSAGE
            : `Upload up to ${FILE_TYPE_CONFIGS.image.maxFiles} JPG, PNG, or WEBP images (max ${MAX_FILE_SIZE_MB.image}MB each).`
        }
        items={galleryImages}
        uploadLabel="Upload"
        isLoading={isFetchingImages}
        onFileUploadTileClick={
          canModifyFiles ? getImageGeneralActionHandler('upload') : undefined
        }
        onFileDrop={
          canModifyFiles
            ? (file) => processSelectedFile(file, 'image')
            : undefined
        }
        uploadDisabled={!canModifyFiles || isImageUploadDisabled}
        showInfoBanner={canModifyFiles}
        renderItem={renderGalleryImageCard}
      />
      <GalleryAccordion<GalleryDocument>
        eventKey="documents"
        title="Public documents"
        description={
          isDocumentMaxFilesReached
            ? MAX_FILES_REACHED_MESSAGE
            : `Documents are only accepted in PDF format with a ${MAX_FILE_SIZE_MB.document}MB file size limit. Maximum ${FILE_TYPE_CONFIGS.document.maxFiles} documents.`
        }
        items={galleryDocuments}
        uploadLabel="Upload"
        isLoading={isFetching}
        onFileUploadTileClick={
          canModifyFiles ? getDocumentGeneralActionHandler('upload') : undefined
        }
        onFileDrop={
          canModifyFiles
            ? (file) => processSelectedFile(file, 'document')
            : undefined
        }
        uploadDisabled={!canModifyFiles || isDocumentUploadDisabled}
        showInfoBanner={canModifyFiles}
        renderItem={renderGalleryDocumentCard}
      />

      <DocumentUploadModal />
      <ImageUploadModal />
      <DeleteFileModal
        onConfirm={
          deleteModalState?.fileToDelete?.type === 'image'
            ? getImageGeneralActionHandler('confirm-delete')
            : getDocumentGeneralActionHandler('confirm-delete')
        }
      />
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
