import React, { useEffect, useState } from "react";
import { Modal, AlertDialog } from "@bcgov/design-system-react-components";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

// Helper to check if a file is an image
const isImageFile = (file: File) =>
  /\.(jpg|jpeg|png|heic|webp|gif|bmp|tiff)$/i.test(file.name);

interface UploadFileModalProps {
  open: boolean;
  file: File | null;
  title: string;
  onTitleChange: (title: string) => void;
  onCancel: () => void;
  onUpload: () => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  open,
  file,
  title,
  onTitleChange,
  onCancel,
  onUpload,
}) => {
  useEffect(() => {
    if (file && !title) {
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
      onTitleChange(defaultTitle);
    }
    // eslint-disable-next-line
  }, [file]);

  if (!open || !file) return null;
  return (
    <Modal isOpen={open}>
      <AlertDialog
        title="Upload new file"
        variant="confirmation"
        isCloseable={false}
        role="dialog"
        isIconHidden={true}
        buttons={[
          <Button key="cancel" variant="tertiary" onClick={onCancel}>
            Cancel
          </Button>,
          <Button
            key="upload"
            variant="secondary"
            onClick={onUpload}
            disabled={!title.trim()}
          >
            Upload
          </Button>,
        ]}
      >
        <div
          style={{
            background: "#FFF7E0",
            color: "#8A6D1B",
            border: "1px solid #FFE6A0",
            borderRadius: 4,
            padding: 8,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            fontSize: 14,
          }}
        >
          <span style={{ marginRight: 8, fontWeight: 600 }}>⚠️</span>
          Uploading images will directly publish to the public website.
        </div>
        {isImageFile(file) ? (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 4,
              marginBottom: 16,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} size="3x" color="#d32f2f" />
          </div>
        )}
        <div style={{ marginBottom: 8, fontSize: 15 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              style={{
                fontWeight: 600,
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "2px 8px",
                minWidth: 0,
                width: 180,
              }}
              maxLength={100}
              placeholder="Enter document title"
            />
          </div>
        </div>
      </AlertDialog>
    </Modal>
  );
};
