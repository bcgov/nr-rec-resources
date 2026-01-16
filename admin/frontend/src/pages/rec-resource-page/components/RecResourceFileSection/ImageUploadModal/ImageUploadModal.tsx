import { BaseFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal';
import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { faInfoCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { useImageUploadForm } from './hooks';
import { ImageUploadForm } from './sections';

const formatFileSize = (bytes: number): string =>
  `${Math.round(bytes / 1024)} KB`;

export const ImageUploadModal: FC = () => {
  const {
    uploadModalState: { showUploadOverlay, selectedFileForUpload },
    getImageGeneralActionHandler,
  } = useRecResourceFileTransferState();

  const { control, resetForm, uploadState, isUploadEnabled } =
    useImageUploadForm(selectedFileForUpload?.name);

  if (!showUploadOverlay || !selectedFileForUpload) return null;

  if (selectedFileForUpload.type !== 'image') return null;

  const handleCancel = () => {
    resetForm();
    getImageGeneralActionHandler('cancel-upload')();
  };

  const handleUpload = () => {
    if (isUploadEnabled) {
      getImageGeneralActionHandler('confirm-upload')();
    }
  };

  const fileSize = selectedFileForUpload.pendingFile?.size;

  const alerts = [
    {
      variant: 'info' as const,
      icon: faInfoCircle,
      text: 'Uploading this photo will publish to the public website.',
    },
  ];

  return (
    <BaseFileModal
      show={showUploadOverlay}
      onHide={handleCancel}
      title="Upload Photo"
      galleryFile={selectedFileForUpload}
      alerts={alerts}
      onCancel={handleCancel}
      onConfirm={handleUpload}
      confirmButtonText="Upload"
      confirmButtonIcon={faUpload}
      confirmButtonDisabled={!isUploadEnabled}
    >
      <div className="base-file-modal__file-info">
        <span>{selectedFileForUpload.name}</span>
        {fileSize !== undefined && <span>{formatFileSize(fileSize)}</span>}
      </div>

      <ImageUploadForm control={control} uploadState={uploadState} />
    </BaseFileModal>
  );
};
