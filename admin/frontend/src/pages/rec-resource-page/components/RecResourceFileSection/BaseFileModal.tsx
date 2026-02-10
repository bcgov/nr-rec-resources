import { ClampLines } from '@/components';
import { COLOR_RED } from '@/styles/colors';
import {
  IconDefinition,
  faFilePdf,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, ReactNode } from 'react';
import {
  Alert,
  AlertProps,
  Button,
  ButtonProps,
  Modal,
  Stack,
} from 'react-bootstrap';
import { GalleryFile } from '../../types';
import './BaseFileModal.scss';

interface AlertConfig {
  variant: AlertProps['variant'];
  icon: IconDefinition;
  text: string;
  iconColor?: string;
}

interface BaseFileModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  galleryFile: GalleryFile;
  alerts?: AlertConfig[];
  children?: ReactNode;
  className?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmButtonText?: string;
  confirmButtonIcon?: IconDefinition;
  confirmButtonVariant?: ButtonProps['variant'];
  confirmButtonDisabled?: boolean;
  onImageClick?: () => void;
}

export const BaseFileModal: FC<BaseFileModalProps> = ({
  show,
  onHide,
  title,
  galleryFile,
  alerts,
  children,
  onCancel,
  onConfirm,
  confirmButtonIcon,
  confirmButtonText,
  confirmButtonVariant,
  confirmButtonDisabled = false,
  className = '',
  onImageClick,
}) => {
  if (!show) return null;

  const isImage = galleryFile.type === 'image';

  // Create preview component
  const filePreview = (() => {
    if (isImage) {
      const imageElement = (
        <img
          src={galleryFile.url}
          alt="preview"
          className={`${className}__preview-img base-file-modal__preview-img`}
        />
      );

      return (
        <>
          <h4>Preview</h4>
          {onImageClick ? (
            <button
              type="button"
              onClick={onImageClick}
              className="base-file-modal__preview-button"
              aria-label="View full size image"
            >
              {imageElement}
              <span className="base-file-modal__preview-icon">
                <FontAwesomeIcon icon={faUpRightFromSquare} />
              </span>
            </button>
          ) : (
            imageElement
          )}
        </>
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
        {alerts?.map((alert, index) => (
          <Alert
            key={index}
            variant={alert.variant}
            className={`${className}__alert base-file-modal__alert base-file-modal__alert--${alert.variant} mb-3 d-flex align-items-center`}
          >
            <Stack direction="horizontal" gap={2}>
              <FontAwesomeIcon
                icon={alert.icon}
                className={`${className}__alert-icon base-file-modal__alert-icon me-2`}
                color={alert.iconColor}
                aria-label={alert.variant === 'danger' ? 'Error' : undefined}
              />
              <span
                className={`${className}__alert-text base-file-modal__alert-text`}
              >
                {alert.text}
              </span>
            </Stack>
          </Alert>
        ))}

        {filePreview}

        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel ?? onHide}>
          Cancel
        </Button>
        {onConfirm && (
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            disabled={confirmButtonDisabled}
          >
            {confirmButtonIcon && (
              <FontAwesomeIcon icon={confirmButtonIcon} className="me-2" />
            )}
            {confirmButtonText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
