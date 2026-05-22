import { faTrashCan } from '@fortawesome/pro-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import { Button, ButtonProps, Modal } from 'react-bootstrap';
import './DeleteConfirmationModal.scss';

const defaultConfirmIcon = faTrashCan as unknown as IconProp;

interface DeleteConfirmationModalProps {
  show: boolean;
  title: string;
  description?: ReactNode;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
  confirmText?: string;
  deletingText?: string;
  cancelText?: string;
  cancelVariant?: ButtonProps['variant'];
  confirmVariant?: ButtonProps['variant'];
  confirmIcon?: IconProp;
  children?: ReactNode;
}

export const DeleteConfirmationModal = ({
  show,
  title,
  description,
  isDeleting = false,
  onCancel,
  onConfirm,
  className,
  confirmText = 'Delete',
  deletingText = 'Deleting...',
  cancelText = 'Cancel',
  cancelVariant = 'outline-primary',
  confirmVariant = 'danger',
  confirmIcon = defaultConfirmIcon,
  children,
}: DeleteConfirmationModalProps) => {
  return (
    <Modal show={show} onHide={onCancel} centered className={className}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {description}
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button variant={cancelVariant} onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {!isDeleting && confirmIcon && (
            <FontAwesomeIcon icon={confirmIcon} className="me-2" />
          )}
          {isDeleting ? deletingText : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
