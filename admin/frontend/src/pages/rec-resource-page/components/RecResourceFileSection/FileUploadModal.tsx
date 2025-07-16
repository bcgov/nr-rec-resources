import { getFileNameWithoutExtension } from "@/utils/fileUtils";
import { isImageFile } from "@/utils/imageUtils";
import {
  faExclamationTriangle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FC, useEffect } from "react";
import { BaseFileModal } from "./BaseFileModal";
import "./FileUploadModal.scss";

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

  const alertConfig = {
    variant: "warning" as const,
    icon: faExclamationTriangle,
    text: "Uploading images will directly publish to the public website.",
  };

  return (
    <BaseFileModal
      show={open}
      onHide={onCancel}
      title={modalTitle}
      file={file}
      alertConfig={alertConfig}
      className="upload-file-modal"
      onCancel={onCancel}
      onConfirm={onUploadConfirmation}
      confirmButtonText="Upload"
      confirmButtonIcon={faUpload}
    >
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
    </BaseFileModal>
  );
};
