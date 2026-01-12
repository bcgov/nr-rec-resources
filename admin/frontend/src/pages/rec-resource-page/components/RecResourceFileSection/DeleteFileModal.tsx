import { ClampLines } from '@/components';
import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import {
  GalleryFile,
  GalleryGeneralAction,
} from '@/pages/rec-resource-page/types';
import { COLOR_RED } from '@/styles/colors';
import { faTrash, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { BaseFileModal } from './BaseFileModal';

// Props interface for testing
interface DeleteFileModalProps {
  open?: boolean;
  file?: GalleryFile;
  onAction?: (action: GalleryGeneralAction, file?: GalleryFile) => void;
}

export const DeleteFileModal: FC<DeleteFileModalProps> = () => {
  const {
    deleteModalState: { showDeleteModal, fileToDelete },
    getDocumentGeneralActionHandler,
    getImageGeneralActionHandler,
  } = useRecResourceFileTransferState();

  if (!showDeleteModal || !fileToDelete) return null;

  // Determine which handler to use based on file type
  const isImageDelete = fileToDelete.type === 'image';

  const handleCancel = isImageDelete
    ? getImageGeneralActionHandler('cancel-delete')
    : getDocumentGeneralActionHandler('cancel-delete');

  const handleConfirm = isImageDelete
    ? getImageGeneralActionHandler('confirm-delete')
    : getDocumentGeneralActionHandler('confirm-delete');
  const alerts = [
    {
      variant: 'danger' as const,
      icon: faWarning,
      iconColor: COLOR_RED,
      text: 'Deleting this file will remove it from the public site within 15 minutes. This action cannot be undone.',
    },
  ];

  return (
    <BaseFileModal
      show={showDeleteModal}
      onHide={handleCancel}
      title="Delete File"
      galleryFile={fileToDelete}
      alerts={alerts}
      className="delete-file-modal"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      confirmButtonText="Delete"
      confirmButtonIcon={faTrash}
      confirmButtonVariant="danger"
    >
      <div className="delete-file-modal__confirmation-text">
        Are you sure you want to delete file?
        <strong>
          <ClampLines lines={3} text={fileToDelete.name} />
        </strong>
      </div>
    </BaseFileModal>
  );
};
