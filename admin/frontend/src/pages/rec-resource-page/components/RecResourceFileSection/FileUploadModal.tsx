import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { setUploadFileName } from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import {
  faExclamationTriangle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FC } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { BaseFileModal } from "./BaseFileModal";
import "./FileUploadModal.scss";

export const FileUploadModal: FC = () => {
  const {
    uploadModalState: {
      showUploadOverlay,
      selectedFileForUpload,
      uploadFileName,
      fileNameError,
    },
    getDocumentGeneralActionHandler,
    getImageGeneralActionHandler,
  } = useRecResourceFileTransferState();

  if (!showUploadOverlay || !selectedFileForUpload) return null;

  const isImage = selectedFileForUpload.type === "image";
  const modalTitle = isImage ? "Upload image" : "Upload file";

  // Use the appropriate action handler based on file type
  const getGeneralActionHandler = isImage
    ? getImageGeneralActionHandler
    : getDocumentGeneralActionHandler;

  const handleCancel = getGeneralActionHandler("cancel-upload");
  const handleConfirm = getGeneralActionHandler("confirm-upload");

  const alertConfig = {
    variant: "warning",
    icon: faExclamationTriangle,
    text: "Uploading files will directly publish to the public website.",
  };

  const isFilenameInvalid = !!fileNameError;

  // Prevent form submission if filename is invalid
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFilenameInvalid) {
      handleConfirm();
    }
  };

  return (
    <BaseFileModal
      show={showUploadOverlay}
      onHide={handleCancel}
      title={modalTitle}
      galleryFile={selectedFileForUpload}
      alertConfig={alertConfig}
      className="upload-file-modal"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
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
