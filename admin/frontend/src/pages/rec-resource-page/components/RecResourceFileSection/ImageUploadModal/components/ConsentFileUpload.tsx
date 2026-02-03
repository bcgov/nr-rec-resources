import { FC, useCallback, useRef } from 'react';
import { Button } from 'react-bootstrap';
import {
  faFilePdf,
  faSquarePlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { COLOR_RED } from '@/styles/colors';

interface ConsentFileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onFileRemove: () => void;
}

export const ConsentFileUpload: FC<ConsentFileUploadProps> = ({
  file,
  onFileSelect,
  onFileRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        // Validate PDF only
        if (selectedFile.type !== 'application/pdf') {
          alert('Please select a PDF file.');
          return;
        }
        onFileSelect(selectedFile);
      }
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [onFileSelect],
  );

  if (file) {
    return (
      <div className="file-upload has-file">
        <div className="file-info">
          <FontAwesomeIcon
            icon={faFilePdf}
            size="lg"
            color={COLOR_RED}
            className="me-2"
          />
          <span className="filename">{file.name}</span>
          <span className="size">({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={onFileRemove}
          aria-label="Remove consent form"
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </div>
    );
  }

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        variant="primary"
        className="w-100 text-white"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faSquarePlus} className="me-2" />
        Attach file
      </Button>
    </div>
  );
};
