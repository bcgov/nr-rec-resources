import { ClampLines } from '@/components';
import { COLOR_GREY_MED, COLOR_RED } from '@/styles/colors';
import { heicToPreviewUrl } from '@/utils/imageProcessing';
import {
  IconDefinition,
  faFilePdf,
  faImage,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, ReactNode, useEffect, useState } from 'react';
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
  const isImage = galleryFile.type === 'image';
  const isHeicImage =
    isImage &&
    (galleryFile.extension === 'heic' || galleryFile.extension === 'heif');

  const [heicPreviewUrl, setHeicPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!show || !isHeicImage || !galleryFile.pendingFile) {
      setHeicPreviewUrl(null);
      return;
    }
    let cancelled = false;
    const pendingFile = galleryFile.pendingFile;

    async function loadPreview() {
      const url = await heicToPreviewUrl(pendingFile);
      if (!cancelled) setHeicPreviewUrl(url);
    }

    // heicToPreviewUrl handles decode errors internally and returns null;
    // catch is required to satisfy the promise/catch-or-return lint rule
    loadPreview().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [show, isHeicImage, galleryFile.pendingFile]);

  if (!show) return null;

  // HEIC requires async decode before a URL is available; standard images have
  // url set immediately. Derive a single value so both share the same render path.
  const imagePreviewUrl = isHeicImage ? heicPreviewUrl : galleryFile.url;

  const filePreview = (() => {
    if (!isImage) {
      return (
        <div
          className={`${className}__preview-pdf base-file-modal__preview-pdf`}
        >
          <FontAwesomeIcon icon={faFilePdf} size="3x" color={COLOR_RED} />
          <div
            className={`${className}__file-name base-file-modal__file-name mt-2`}
          >
            <ClampLines text={galleryFile.name} />
          </div>
        </div>
      );
    }

    if (!imagePreviewUrl) {
      // HEIC decode is in progress (heicToPreviewUrl returns null on failure too)
      return (
        <>
          <h4>Preview</h4>
          <div className="base-file-modal__preview-heic">
            <FontAwesomeIcon icon={faImage} size="3x" color={COLOR_GREY_MED} />
            <span className="base-file-modal__file-name mt-2">
              Loading preview...
            </span>
          </div>
        </>
      );
    }

    const imageElement = (
      <img
        src={imagePreviewUrl}
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
