import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { BaseFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal';

interface EstablishmentOrderUploadModalProps {
  show: boolean;
  file: GalleryFile | null;
  fileName: string;
  fileNameError?: string;
  onFileNameChange: (fileName: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const EstablishmentOrderUploadModal: FC<
  EstablishmentOrderUploadModalProps
> = ({
  show,
  file,
  fileName,
  fileNameError,
  onFileNameChange,
  onCancel,
  onConfirm,
}) => {
  if (!show || !file) return null;

  const isFilenameInvalid = !!fileNameError;

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFilenameInvalid) {
      onConfirm();
    }
  };

  return (
    <BaseFileModal
      show={show}
      onHide={onCancel}
      title="Upload establishment order"
      galleryFile={file}
      className="upload-file-modal"
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmButtonText="Upload"
      confirmButtonIcon={faUpload}
      confirmButtonDisabled={isFilenameInvalid}
    >
      <Form onSubmit={handleFormSubmit}>
        <Form.Group as={Row}>
          <Form.Label column sm={4} className="fw-bold">
            Name
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
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
