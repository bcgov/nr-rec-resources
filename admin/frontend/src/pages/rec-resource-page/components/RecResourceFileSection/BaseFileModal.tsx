import { CustomButton } from "@/components";
import { COLOR_RED } from "@/styles/colors";
import { isImageFile } from "@/utils/imageUtils";
import { faFilePdf, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactNode } from "react";
import { Alert, AlertProps, ButtonProps, Modal, Stack } from "react-bootstrap";
import "./BaseFileModal.scss";

interface BaseFileModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  file?: File | null;
  fileUrl?: string;
  fileName?: string;
  alertConfig?: {
    variant: AlertProps["variant"];
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
  confirmButtonVariant?: ButtonProps["variant"];
}

export const BaseFileModal: FC<BaseFileModalProps> = ({
  show,
  onHide,
  title,
  file,
  fileUrl,
  fileName,
  alertConfig,
  children,
  onCancel,
  onConfirm,
  confirmButtonIcon,
  confirmButtonText,
  confirmButtonVariant,
  className = "",
}) => {
  if (!show) return null;

  // Determine if we're dealing with an image
  const isImage = file
    ? isImageFile(file)
    : fileUrl
      ? /\.(jpg|jpeg|png|heic|webp|gif|bmp|tiff)$/i.test(fileUrl)
      : false;

  // Create preview component
  const filePreview = (() => {
    if (file && isImage) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className={`${className}__preview-img base-file-modal__preview-img`}
        />
      );
    }

    if (fileUrl && isImage) {
      return (
        <img
          src={fileUrl}
          alt="preview"
          className={`${className}__preview-img base-file-modal__preview-img`}
        />
      );
    }

    // Show PDF icon for non-image files
    return (
      <div className={`${className}__preview-pdf base-file-modal__preview-pdf`}>
        <FontAwesomeIcon icon={faFilePdf} size="3x" color={COLOR_RED} />
        {fileName && (
          <div
            className={`${className}__file-name base-file-modal__file-name mt-2`}
          >
            {fileName}
          </div>
        )}
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
        >
          {confirmButtonText}
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
};
