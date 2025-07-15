import { CustomButton } from "@/components";
import { GalleryAction, GalleryFile } from "@/pages/rec-resource-page/types";
import { COLOR_RED } from "@/styles/colors";
import {
  faExclamationTriangle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Modal, Stack } from "react-bootstrap";
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
          <FontAwesomeIcon icon={faTrash} className="me-2" />
          Delete File
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Stack direction="horizontal" gap={2} className="mb-3">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="delete-file-modal__alert-icon me-2"
            color={COLOR_RED}
          />
          <span className="delete-file-modal__alert-text">
            Are you sure you want to delete <b>{file.name}</b>? This action
            cannot be undone.
          </span>
        </Stack>
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
        >
          Yes, Delete
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
};
