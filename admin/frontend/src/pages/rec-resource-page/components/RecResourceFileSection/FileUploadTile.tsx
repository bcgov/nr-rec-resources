import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Stack } from "react-bootstrap";
import { FC } from "react";
import "./FileUploadTile.scss";

interface UploadTileProps {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}

export const FileUploadTile: FC<UploadTileProps> = ({
  disabled = false,
  label,
  onClick,
}) => (
  <Stack
    direction="vertical"
    gap={0}
    data-testid="upload-tile"
    onClick={disabled ? undefined : onClick}
    className={`upload-tile align-items-center justify-content-center w-100 h-100 ${disabled ? "disabled" : ""}`}
  >
    <span className="fs-2 text-muted">
      <FontAwesomeIcon icon={faPlus} />
    </span>
    <span className="fs-6 text-muted mt-1">{label}</span>
  </Stack>
);
