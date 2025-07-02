import React from 'react';
import { Modal, AlertDialog } from '@bcgov/design-system-react-components';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

// Helper to check if a file is an image
const isImageFile = (file: File) =>
  /\.(jpg|jpeg|png|heic|webp|gif|bmp|tiff)$/i.test(file.name);

interface UploadFileModalProps {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onUpload: () => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  open,
  file,
  onCancel,
  onUpload,
}) => {
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
          <Button key="upload" variant="secondary" onClick={onUpload}>
            Upload
          </Button>,
        ]}
      >
        <div
          style={{
            background: '#FFF7E0',
            color: '#8A6D1B',
            border: '1px solid #FFE6A0',
            borderRadius: 4,
            padding: 8,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
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
              width: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: 4,
              marginBottom: 16,
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} size="3x" color="#d32f2f" />
          </div>
        )}
        <div style={{ marginBottom: 8, fontSize: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Name</span>
            <span style={{ fontWeight: 600 }}>{file.name.split('.')[0]}</span>
          </div>
        </div>
      </AlertDialog>
    </Modal>
  );
};
