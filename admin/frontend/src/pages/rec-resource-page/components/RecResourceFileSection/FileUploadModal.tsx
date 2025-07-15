import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { setUploadFileName } from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { getFileNameWithoutExtension } from "@/utils/fileUtils";
import { isImageFile } from "@/utils/imageUtils";
import {
  faExclamationTriangle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FC, useEffect } from "react";
import { BaseFileModal } from "./BaseFileModal";
import "./FileUploadModal.scss";

export const FileUploadModal: FC = () => {
  const {
    uploadModalState: {
      showUploadOverlay,
      selectedFileForUpload,
      uploadFileName,
    },
    getDocumentGeneralActionHandler,
  } = useRecResourceFileTransferState();

  // Set default file name
  useEffect(() => {
    if (selectedFileForUpload) {
      const defaultTitle = getFileNameWithoutExtension(selectedFileForUpload);
      setUploadFileName(defaultTitle);
    }
  }, [selectedFileForUpload]);

  if (!showUploadOverlay || !selectedFileForUpload) return null;

  const modalTitle = isImageFile(selectedFileForUpload)
    ? "Upload image"
    : "Upload file";

  const handleCancel = getDocumentGeneralActionHandler("cancel-upload");
  const handleConfirm = getDocumentGeneralActionHandler("confirm-upload");

  const alertConfig = {
    variant: "warning",
    icon: faExclamationTriangle,
    text: "Uploading images will directly publish to the public website.",
  };

  return (
    <BaseFileModal
      show={showUploadOverlay}
      onHide={handleCancel}
      title={modalTitle}
      file={selectedFileForUpload}
      alertConfig={alertConfig}
      className="upload-file-modal"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      confirmButtonText="Upload"
      confirmButtonIcon={faUpload}
    >
      <div className="upload-file-modal__input-label">
        <div className="upload-file-modal__input-row">
          <span>Name</span>
          <input
            type="text"
            value={uploadFileName}
            onChange={(e) => setUploadFileName(e.target.value)}
            className="upload-file-modal__input"
            maxLength={100}
            placeholder="Enter document title"
          />
        </div>
      </div>
    </BaseFileModal>
  );
};
