import { ClampLines } from '@/components';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { COLOR_RED } from '@/styles/colors';
import { faTrash, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { BaseFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal';

interface EstablishmentOrderDeleteModalProps {
  show: boolean;
  file: GalleryFile | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const EstablishmentOrderDeleteModal: FC<
  EstablishmentOrderDeleteModalProps
> = ({ show, file, onCancel, onConfirm }) => {
  if (!show || !file) return null;

  const alerts = [
    {
      variant: 'danger' as const,
      icon: faWarning,
      iconColor: COLOR_RED,
      text: 'Deleting this establishment order document is permanent and cannot be undone.',
    },
  ];

  return (
    <BaseFileModal
      show={show}
      onHide={onCancel}
      title="Delete establishment order"
      galleryFile={file}
      alerts={alerts}
      className="delete-file-modal"
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmButtonText="Delete"
      confirmButtonIcon={faTrash}
      confirmButtonVariant="danger"
    >
      <div className="delete-file-modal__confirmation-text">
        Are you sure you want to delete this establishment order?
        <strong>
          <ClampLines lines={3} text={file.name} />
        </strong>
      </div>
    </BaseFileModal>
  );
};
