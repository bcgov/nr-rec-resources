import { BaseFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal';
import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { faInfoCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FC, useCallback, useRef, useState } from 'react';
import { ImageUploadForm, ImageUploadFormHandlers } from './sections';

const formatFileSize = (bytes: number): string =>
  `${Math.round(bytes / 1024)} KB`;

export const ImageUploadModal: FC = () => {
  const {
    uploadModalState: { showUploadOverlay, selectedFileForUpload },
    getImageGeneralActionHandler,
  } = useRecResourceFileTransferState();

  const [isFormValid, setIsFormValid] = useState(false);
  const resetFormRef = useRef<() => void>(() => {});

  const handleFormReady = useCallback((handlers: ImageUploadFormHandlers) => {
    resetFormRef.current = handlers.resetForm;
    setIsFormValid(handlers.isValid);
  }, []);

  if (!showUploadOverlay || !selectedFileForUpload) return null;

  if (selectedFileForUpload.type !== 'image') return null;

  const handleCancel = () => {
    resetFormRef.current();
    getImageGeneralActionHandler('cancel-upload')();
  };

  const handleUpload = () => {
    getImageGeneralActionHandler('confirm-upload')();
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
      confirmButtonDisabled={!isFormValid}
    >
      <div className="base-file-modal__file-info">
        <span>{selectedFileForUpload.name}</span>
        {fileSize !== undefined && <span>{formatFileSize(fileSize)}</span>}
      </div>

      <ImageUploadForm
        fileName={selectedFileForUpload.name}
        onUpload={handleUpload}
        onFormReady={handleFormReady}
      />
    </BaseFileModal>
  );
};
