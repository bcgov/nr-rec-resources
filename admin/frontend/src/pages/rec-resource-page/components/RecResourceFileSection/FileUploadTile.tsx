import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { Stack } from 'react-bootstrap';
import './FileUploadTile.scss';

interface FileUploadTileProps {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}

export const FileUploadTile: FC<FileUploadTileProps> = ({
  disabled = false,
  label,
  onClick,
}) => (
  <Stack
    direction="vertical"
    gap={0}
    data-testid="upload-tile"
    onClick={disabled ? undefined : onClick}
    className={`upload-tile align-items-center justify-content-center w-100 h-100 ${disabled ? 'disabled' : ''}`}
  >
    <span className="fs-2">
      <FontAwesomeIcon icon={faPlus} />
    </span>
    <span className="fs-6 mt-1">{label}</span>
  </Stack>
);
