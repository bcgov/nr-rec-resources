import { CustomButton } from "@/components";
import { COLOR_RED } from "@/styles/colors";
import { faTrash, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Alert, Modal, Stack } from "react-bootstrap";
import { useRecResourceFileTransferState } from "../../hooks/useRecResourceFileTransferState";
import "./DeleteFileModal.scss";

export const DeleteFileModal: FC = () => {
  const {
    getDocumentGeneralActionHandler,
    deleteModalState: { docToDelete, showDeleteModal },
  } = useRecResourceFileTransferState();

  if (!showDeleteModal || !docToDelete) return null;

  return (
    <Modal
      show={showDeleteModal}
      onHide={getDocumentGeneralActionHandler("cancel-delete")}
      centered
      size="lg"
      className="delete-file-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="delete-file-modal__title">
          Delete File
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="danger" className="delete-file-modal__alert">
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <FontAwesomeIcon icon={faWarning} color={COLOR_RED} />
            <span className="delete-file-modal__alert-text">
              Deleting this image will remove it from the public site. This
              action cannot be undone.
            </span>
          </Stack>
        </Alert>
        <span className="delete-file-modal__alert-text">
          Are you sure you want to delete file: <b>{docToDelete.name}</b>?
        </span>
      </Modal.Body>
      <Modal.Footer>
        <CustomButton
          variant="tertiary"
          onClick={getDocumentGeneralActionHandler("cancel-delete")}
        >
          Cancel
        </CustomButton>
        <CustomButton
          variant="danger"
          onClick={getDocumentGeneralActionHandler("confirm-delete")}
          leftIcon={<FontAwesomeIcon icon={faTrash} />}
        >
          Delete
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
};
