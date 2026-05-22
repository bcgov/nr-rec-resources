import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { faInfoCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { BaseFileModal } from './BaseFileModal';
import { GalleryFile } from '@/pages/rec-resource-page/types';

interface DocumentUploadModalProps {
  show?: boolean;
  file?: GalleryFile | null;
  fileName?: string;
  fileNameError?: string;
  onFileNameChange?: (fileName: string) => void;
  onCancel?: () => void;
  onConfirm?: () => void | Promise<void>;
  title?: string;
}

export const DocumentUploadModal: FC<DocumentUploadModalProps> = ({
  show,
  file,
  fileName,
  fileNameError: propFileNameError,
  onFileNameChange,
  onCancel: propOnCancel,
  onConfirm: propOnConfirm,
  title,
}) => {
  // Use props if provided, otherwise fall back to store-based state
  const usePropsMode = show !== undefined;
  const {
    uploadModalState: {
      showUploadOverlay,
      selectedFileForUpload,
      uploadFileName: storeUploadFileName,
      fileNameError: storeFileNameError,
    },
    getDocumentGeneralActionHandler,
  } = useRecResourceFileTransferState();

  // Determine which values to use
  const isVisible = usePropsMode ? show : showUploadOverlay;
  const selectedFile = usePropsMode ? file : selectedFileForUpload;
  const currentFileName = usePropsMode ? fileName : storeUploadFileName;
  const currentFileNameError = usePropsMode
    ? propFileNameError
    : storeFileNameError;

  if (!isVisible || !selectedFile) return null;

  // Images are handled by ImageUploadModal
  if (selectedFile.type === 'image') return null;

  const modalTitle = title || 'Upload document';

  const handleCancel = usePropsMode
    ? propOnCancel || (() => {})
    : getDocumentGeneralActionHandler('cancel-upload');

  const handleConfirm = usePropsMode
    ? propOnConfirm || (() => {})
    : getDocumentGeneralActionHandler('confirm-upload');

  const alerts = [
    {
      variant: 'info' as const,
      icon: faInfoCircle,
      text: 'Uploading files will directly publish to the public website within 15 minutess.',
    },
  ];

  const isFilenameInvalid = !!currentFileNameError;
  const hasValidationErrors = isFilenameInvalid;

  // Prevent form submission if filename or file is invalid
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasValidationErrors) {
      handleConfirm();
    }
  };

  const handleFileNameChange = (newFileName: string) => {
    if (usePropsMode && onFileNameChange) {
      onFileNameChange(newFileName);
    } else if (!usePropsMode) {
      setUploadFileName(newFileName);
    }
  };

  return (
    <BaseFileModal
      show={isVisible}
      onHide={handleCancel}
      title={modalTitle}
      galleryFile={selectedFile}
      alerts={alerts}
      className="upload-file-modal"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      confirmButtonText="Upload"
      confirmButtonIcon={faUpload}
      confirmButtonDisabled={hasValidationErrors}
    >
      <Form onSubmit={handleFormSubmit}>
        <Form.Group as={Row}>
          <Form.Label column sm={4} className="base-file-modal__form-label">
            Name
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              value={currentFileName}
              onChange={(e) => handleFileNameChange(e.target.value)}
              maxLength={100}
              placeholder="Enter file name"
              isInvalid={isFilenameInvalid}
            />
            <Form.Control.Feedback type="invalid">
              {currentFileNameError}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
      </Form>
    </BaseFileModal>
  );
};
