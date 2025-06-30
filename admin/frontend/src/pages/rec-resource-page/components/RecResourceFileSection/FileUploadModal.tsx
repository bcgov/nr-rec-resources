import { FC, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./FileUploadModal.scss";
import { Stack, Alert, Modal } from "react-bootstrap";
import { getFileNameWithoutExtension } from "@/utils/fileUtils";
import { CustomButton } from "@/components";
import { isImageFile } from "@/utils/imageUtils";

interface UploadFileModalProps {
  open: boolean;
  file: File | null;
  fileName: string;
  onFileNameChange: (newFileName: string) => void;
  onCancel: () => void;
  onUploadConfirmation: () => void;
}

export const FileUploadModal: FC<UploadFileModalProps> = ({
  open,
  file,
  fileName,
  onFileNameChange,
  onCancel,
  onUploadConfirmation,
}) => {
  // Set default file name
  useEffect(() => {
    if (file && !fileName) {
      const defaultTitle = getFileNameWithoutExtension(file);
      onFileNameChange(defaultTitle);
    }
  }, [file, fileName]);

  if (!open || !file) return null;

  const modalTitle = isImageFile(file) ? "Upload image" : "Upload file";

  const filePreview = isImageFile(file) ? (
    <img
      src={URL.createObjectURL(file)}
      alt="preview"
      className="upload-file-modal__preview-img"
    />
  ) : (
    <div className="upload-file-modal__preview-pdf">
      <FontAwesomeIcon icon={faFilePdf} size="3x" color="#d32f2f" />
    </div>
  );

  return (
    <Modal
      show={open}
      onHide={onCancel}
      centered
      size="lg"
      className="upload-file-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="upload-file-modal__title">
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Alert about publishing */}
        <Alert
          variant="warning"
          className="upload-file-modal__alert mb-3 d-flex align-items-center"
        >
          <Stack direction="horizontal" gap={2}>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="upload-file-modal__alert-icon me-2"
            />
            <span className="upload-file-modal__alert-text">
              Uploading images will directly publish to the public website.
            </span>
          </Stack>
        </Alert>
        {filePreview}
        <div className="upload-file-modal__input-label">
          <div className="upload-file-modal__input-row">
            <span>Name</span>
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              className="upload-file-modal__input"
              maxLength={100}
              placeholder="Enter document title"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <CustomButton variant="tertiary" onClick={onCancel}>
          Cancel
        </CustomButton>
        <CustomButton
          variant="secondary"
          onClick={onUploadConfirmation}
          disabled={!fileName.trim()}
        >
          Upload
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
};
