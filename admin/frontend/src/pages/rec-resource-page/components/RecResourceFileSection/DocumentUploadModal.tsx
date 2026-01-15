import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import {
  faExclamationTriangle,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { BaseFileModal } from './BaseFileModal';

export const DocumentUploadModal: FC = () => {
  const {
    uploadModalState: {
      showUploadOverlay,
      selectedFileForUpload,
      uploadFileName,
      fileNameError,
    },
    getDocumentGeneralActionHandler,
  } = useRecResourceFileTransferState();

  if (!showUploadOverlay || !selectedFileForUpload) return null;

  // Images are handled by ImageUploadModal
  if (selectedFileForUpload.type === 'image') return null;

  const modalTitle = 'Upload document';

  const handleCancel = getDocumentGeneralActionHandler('cancel-upload');
  const handleConfirm = getDocumentGeneralActionHandler('confirm-upload');

  const alerts = [
    {
      variant: 'warning' as const,
      icon: faExclamationTriangle,
      text: 'Uploading files will directly publish to the public website within 15 minutess.',
    },
  ];

  const isFilenameInvalid = !!fileNameError;
  const hasValidationErrors = isFilenameInvalid;

  // Prevent form submission if filename or file is invalid
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasValidationErrors) {
      handleConfirm();
    }
  };

  return (
    <BaseFileModal
      show={showUploadOverlay}
      onHide={handleCancel}
      title={modalTitle}
      galleryFile={selectedFileForUpload}
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
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              maxLength={100}
              placeholder="Enter file name"
              isInvalid={isFilenameInvalid}
            />
            <Form.Control.Feedback type="invalid">
              {fileNameError}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
      </Form>
    </BaseFileModal>
  );
};
