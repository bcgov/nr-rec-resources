import { CustomButton } from "@/components";
import { GalleryAction, GalleryFile } from "@/pages/rec-resource-page/types";
import { COLOR_RED } from "@/styles/colors";
import { faTrash, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Alert, Modal, Stack } from "react-bootstrap";
import "./DeleteFileModal.scss";

interface DeleteFileModalProps {
  open: boolean;
  file: GalleryFile;
  onAction: (action: GalleryAction, file: GalleryFile) => void;
}

export const DeleteFileModal: FC<DeleteFileModalProps> = ({
  open,
  file,
  onAction,
}) => {
  return (
    <Modal
      show={open}
      onHide={() => onAction("cancel-delete", file)}
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
          Are you sure you want to delete file: <b>{file.name}</b>?
        </span>
      </Modal.Body>
      <Modal.Footer>
        <CustomButton
          variant="tertiary"
          onClick={() => onAction("cancel-delete", file)}
        >
          Cancel
        </CustomButton>
        <CustomButton
          variant="danger"
          onClick={() => onAction("confirm-delete", file)}
          leftIcon={<FontAwesomeIcon icon={faTrash} />}
        >
          Delete
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
};
