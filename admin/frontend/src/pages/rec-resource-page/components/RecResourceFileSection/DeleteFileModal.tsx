import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import {
  GalleryFile,
  GalleryGeneralAction,
} from "@/pages/rec-resource-page/types";
import { COLOR_RED } from "@/styles/colors";
import { faTrash, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FC } from "react";
import { BaseFileModal } from "./BaseFileModal";

// Props interface for testing
interface DeleteFileModalProps {
  open?: boolean;
  file?: GalleryFile;
  onAction?: (action: GalleryGeneralAction, file?: GalleryFile) => void;
}

export const DeleteFileModal: FC<DeleteFileModalProps> = () => {
  const {
    deleteModalState: { showDeleteModal, docToDelete },
    getDocumentGeneralActionHandler,
  } = useRecResourceFileTransferState();

  if (!showDeleteModal || !docToDelete) return null;

  const handleCancel = getDocumentGeneralActionHandler("cancel-delete");
  const handleConfirm = getDocumentGeneralActionHandler("confirm-delete");

  const alertConfig = {
    variant: "danger" as const,
    icon: faWarning,
    iconColor: COLOR_RED,
    text: "Deleting this file will remove it from the public site. This action cannot be undone.",
  };

  return (
    <BaseFileModal
      show={showDeleteModal}
      onHide={handleCancel}
      title="Delete File"
      fileUrl={docToDelete.url}
      fileName={docToDelete.name}
      alertConfig={alertConfig}
      className="delete-file-modal"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      confirmButtonText="Delete"
      confirmButtonIcon={faTrash}
      confirmButtonVariant="danger"
    >
      <div className="delete-file-modal__confirmation-text">
        Are you sure you want to delete file:{" "}
        <strong>{docToDelete.name}</strong>?
      </div>
    </BaseFileModal>
  );
};
