import { ClampLines } from '@/components';
import {
  hideDeleteModal,
  recResourceFileTransferStore,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { COLOR_RED } from '@/styles/colors';
import { faTrash, faWarning } from '@fortawesome/free-solid-svg-icons';
import { useStore } from '@tanstack/react-store';
import { FC } from 'react';
import { BaseFileModal } from '@/components/file/BaseFileModal';

interface DeleteFileModalProps {
  show?: boolean;
  file?: GalleryFile | null;
  onCancel?: () => void;
  onConfirm?: () => void;
  title?: string;
  alertText?: string;
  confirmationText?: string;
}

export const DeleteFileModal: FC<DeleteFileModalProps> = ({
  show,
  file,
  onCancel: propOnCancel,
  onConfirm: propOnConfirm,
  title = 'Delete File',
  alertText = 'Deleting this file will remove it from the public site within 15 minutes. This action cannot be undone.',
  confirmationText = 'Are you sure you want to delete this file?',
}) => {
  // Use props if provided, otherwise fall back to store-based state
  const usePropsMode = show !== undefined;

  const {
    showDeleteModal: storeShowDeleteModal,
    fileToDelete: storeFileToDelete,
  } = useStore(recResourceFileTransferStore);

  // Determine which values to use
  const isVisible = usePropsMode ? show : storeShowDeleteModal;
  const selectedFile = usePropsMode ? file : storeFileToDelete;

  if (!isVisible || !selectedFile) return null;

  const handleCancel = usePropsMode
    ? propOnCancel || (() => {})
    : hideDeleteModal;

  const handleConfirm = propOnConfirm ?? (() => {});

  const alerts = [
    {
      variant: 'danger' as const,
      icon: faWarning,
      iconColor: COLOR_RED,
      text: alertText,
    },
  ];

  return (
    <BaseFileModal
      show={isVisible}
      onHide={handleCancel}
      title={title}
      galleryFile={selectedFile}
      alerts={alerts}
      className="delete-file-modal"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      confirmButtonText="Delete"
      confirmButtonIcon={faTrash}
      confirmButtonVariant="danger"
    >
      <div className="delete-file-modal__confirmation-text">
        {confirmationText}
        <strong>
          <ClampLines lines={3} text={selectedFile.name} />
        </strong>
      </div>
    </BaseFileModal>
  );
};
