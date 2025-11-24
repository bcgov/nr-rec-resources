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

const MAX_UPLOADS = 30;

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

  const reachedMaxUploads = (galleryFiles?.length ?? 0) >= MAX_UPLOADS;
  const uploadDisabled = isUploadDisabled || reachedMaxUploads;

  return (
    <section>
      <h2 className="my-3">Establishment orders</h2>

      {/* warning when the max upload limit is reached */}
      {reachedMaxUploads && (
        <div className="alert alert-warning" role="alert">
          Upload limit reached. Maximum {MAX_UPLOADS} documents allowed.
        </div>
      )}

      <GalleryAccordion
        eventKey="establishment-orders"
        title="Documents"
        description="Documents are only accepted in PDF format with a 9.5 MB file size limit. Maximum 30 documents."
        items={galleryFiles}
        uploadLabel="Upload"
        onFileUploadTileClick={handleUploadClick}
        uploadDisabled={uploadDisabled}
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
