import React from "react";
import { Stack } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CustomButton } from "../custom-button";

interface ResourceHeaderSectionProps {
  name: string;
  recId: string;
  onAddImage?: () => void;
  onAddDocument?: () => void;
}

const ActionButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) => (
  <CustomButton variant="outline-primary" onClick={onClick}>
    <Stack direction="horizontal" gap={2}>
      <FontAwesomeIcon className="action-button-icon" icon={faPlus} />
      {label}
    </Stack>
  </CustomButton>
);

export const ResourceHeaderSection: React.FC<ResourceHeaderSectionProps> = ({
  name,
  recId,
  onAddImage,
  onAddDocument,
}) => (
  <Stack
    direction="horizontal"
    className="justify-content-between resource-header-section"
  >
    <div className="resource-header-title">
      <h1>{name}</h1>
      <span className="resource-badge px-2">{recId}</span>
    </div>
    <Stack direction="horizontal" gap={3} className="py-2 action-buttons">
      <ActionButton label="Add image" onClick={onAddImage} />
      <ActionButton label="Add document" onClick={onAddDocument} />
    </Stack>
  </Stack>
);
