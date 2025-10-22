import { GalleryAccordion } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryAccordion';
import { GalleryFileCard } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard';
import { EstablishmentOrderUploadModal } from './EstablishmentOrderUploadModal';
import { EstablishmentOrderDeleteModal } from './EstablishmentOrderDeleteModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { COLOR_RED } from '@/styles/colors';
import { ESTABLISHMENT_ORDER_ACTIONS } from './constants';
import { useEstablishmentOrderState } from '@/pages/rec-resource-page/hooks/useEstablishmentOrderState';

interface RecResourceEstablishmentOrderSectionProps {
  recResourceId: string;
}

export const RecResourceEstablishmentOrderSection = ({
  recResourceId,
}: RecResourceEstablishmentOrderSectionProps) => {
  const {
    galleryFiles,
    isLoading,
    isUploadDisabled,
    uploadModalState,
    deleteModalState,
    handleUploadClick,
    handleUploadConfirm,
    handleUploadCancel,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleFileAction,
    setUploadFileName,
  } = useEstablishmentOrderState(recResourceId);

  return (
    <section>
      <h2 className="my-3">Establishment orders</h2>
      <GalleryAccordion
        eventKey="establishment-orders"
        title="Documents"
        description="Upload establishment order documents in PDF format."
        items={galleryFiles}
        uploadLabel="Upload"
        onFileUploadTileClick={handleUploadClick}
        uploadDisabled={isUploadDisabled}
        renderItem={(file) => (
          <GalleryFileCard
            file={file}
            getFileActionHandler={handleFileAction}
            actions={ESTABLISHMENT_ORDER_ACTIONS}
            topContent={
              <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
            }
          />
        )}
        isLoading={isLoading}
      />

      <EstablishmentOrderUploadModal
        show={uploadModalState.show}
        file={uploadModalState.file}
        fileName={uploadModalState.fileName}
        fileNameError={uploadModalState.fileNameError}
        onFileNameChange={setUploadFileName}
        onCancel={handleUploadCancel}
        onConfirm={handleUploadConfirm}
      />

      <EstablishmentOrderDeleteModal
        show={deleteModalState.show}
        file={deleteModalState.file}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
};
