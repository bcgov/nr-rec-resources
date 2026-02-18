import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragEvent, FC, useId, useRef, useState } from 'react';
import { OverlayTrigger, Stack, Tooltip } from 'react-bootstrap';
import './FileUploadTile.scss';

interface FileUploadTileProps {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  onFileDrop?: (file: File) => void;
}

export const FileUploadTile: FC<FileUploadTileProps> = ({
  disabled = false,
  label,
  onClick,
  onFileDrop,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);
  const tooltipId = useId();
  const hasDragAndDrop = Boolean(onFileDrop) && !disabled;

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!hasDragAndDrop) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!hasDragAndDrop) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!hasDragAndDrop) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!hasDragAndDrop || !onFileDrop) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragActive(false);

    const [file] = Array.from(event.dataTransfer.files || []);
    if (file) {
      onFileDrop(file);
    }
  };

  return (
    <OverlayTrigger
      placement="top"
      show={disabled ? false : undefined}
      overlay={
        <Tooltip id={tooltipId}>
          Click to select a file or drag and drop one here
        </Tooltip>
      }
    >
      <Stack
        direction="vertical"
        gap={0}
        data-testid="upload-tile"
        onClick={disabled ? undefined : onClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`upload-tile align-items-center justify-content-center w-100 h-100 ${disabled ? 'disabled' : ''} ${isDragActive ? 'active' : ''}`}
      >
        <span className="fs-2">
          <FontAwesomeIcon icon={faPlus} />
        </span>
        <span className="fs-6 mt-1">{label}</span>
      </Stack>
    </OverlayTrigger>
  );
};
