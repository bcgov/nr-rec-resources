import { ClampLines, CustomButton } from '@/components';
import { COLOR_RED } from '@/styles/colors';
import { faFilePdf, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, ReactNode } from 'react';
import { Alert, AlertProps, ButtonProps, Modal, Stack } from 'react-bootstrap';
import { GalleryFile } from '../../types';
import './BaseFileModal.scss';

interface BaseFileModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  galleryFile: GalleryFile;
  alertConfig?: {
    variant: AlertProps['variant'];
    icon: IconDefinition;
    text: string;
    iconColor?: string;
  };
  children?: ReactNode;
  className?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmButtonText: string;
  confirmButtonIcon: IconDefinition;
  confirmButtonVariant?: ButtonProps['variant'];
  confirmButtonDisabled?: boolean;
}

export const BaseFileModal: FC<BaseFileModalProps> = ({
  show,
  onHide,
  title,
  galleryFile,
  alertConfig,
  children,
  onCancel,
  onConfirm,
  confirmButtonIcon,
  confirmButtonText,
  confirmButtonVariant,
  confirmButtonDisabled = false,
  className = '',
}) => {
  if (!show) return null;

  // Determine if we're dealing with an image
  const isImage = galleryFile.type === 'image';

  // Create preview component
  const filePreview = (() => {
    if (isImage) {
      return (
        <img
          src={galleryFile.url}
          alt="preview"
          className={`${className}__preview-img base-file-modal__preview-img`}
        />
      );
    }

    // Show PDF icon for non-image files
    return (
      <div className={`${className}__preview-pdf base-file-modal__preview-pdf`}>
        <FontAwesomeIcon icon={faFilePdf} size="3x" color={COLOR_RED} />
        <div
          className={`${className}__file-name base-file-modal__file-name mt-2`}
        >
          <ClampLines text={galleryFile.name} />
        </div>
      </div>
    );
  })();

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className={`base-file-modal ${className}`}
    >
      <Modal.Header closeButton>
        <Modal.Title className={`${className}__title base-file-modal__title`}>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alertConfig && (
          <Alert
            variant={alertConfig.variant}
            className={`${className}__alert base-file-modal__alert mb-3 d-flex align-items-center`}
          >
            <Stack direction="horizontal" gap={2}>
              <FontAwesomeIcon
                icon={alertConfig.icon}
                className={`${className}__alert-icon base-file-modal__alert-icon me-2`}
                color={alertConfig.iconColor}
              />
              <span
                className={`${className}__alert-text base-file-modal__alert-text`}
              >
                {alertConfig.text}
              </span>
            </Stack>
          </Alert>
        )}

        {filePreview}

        {children}
      </Modal.Body>
      <Modal.Footer>
        <CustomButton variant="tertiary" onClick={onCancel}>
          Cancel
        </CustomButton>
        <CustomButton
          variant={confirmButtonVariant}
          onClick={onConfirm}
          leftIcon={<FontAwesomeIcon icon={confirmButtonIcon} />}
          disabled={confirmButtonDisabled}
        >
          {confirmButtonText}
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
};
