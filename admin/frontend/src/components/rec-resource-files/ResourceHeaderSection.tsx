import React from "react";
import { Stack } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CustomButton } from "../custom-button";

import {
  COLOR_BLUE,
  COLOR_BLUE_LIGHT,
  COLOR_GREEN,
  COLOR_WHITE,
} from "@/styles/colors";
import { CustomBadge } from "../custom-badge";

interface ResourceHeaderSectionProps {
  name: string;
  recId: string;
  status?: string; // e.g., "Open"
  onAddImage?: () => void;
  onAddDocument?: () => void;
}

const ActionButton = ({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick?: () => void;
  icon?: any;
}) => (
  <CustomButton variant="outline-primary" onClick={onClick} className="btn">
    <Stack direction="horizontal" gap={2} className="align-items-center">
      {icon && <FontAwesomeIcon className="action-button-icon" icon={icon} />}
      {label}
    </Stack>
  </CustomButton>
);

export const ResourceHeaderSection: React.FC<ResourceHeaderSectionProps> = ({
  name,
  recId,
  status = "Open",
  onAddImage,
  onAddDocument,
}) => (
  <Stack direction="vertical" className="resource-header-section" gap={2}>
    {/* section: name, rec id, status, and action buttons */}
    <Stack direction="horizontal" gap={2} className="justify-content-between">
      {/* name, rec id, and badge */}
      <Stack direction="horizontal" gap={2}>
        <h1 className="resource-header-title-text">{name}</h1>
        <CustomBadge
          label={recId}
          bgColor={COLOR_BLUE_LIGHT}
          textColor={COLOR_BLUE}
        />
        <CustomBadge
          label={status}
          bgColor={COLOR_GREEN}
          textColor={COLOR_WHITE}
        />
      </Stack>

      {/* action buttons */}
      <Stack
        direction="horizontal"
        gap={2}
        className="py-2 action-buttons align-items-center"
      >
        <ActionButton label="Add image" onClick={onAddImage} icon={faPlus} />
        <ActionButton
          label="Add document"
          onClick={onAddDocument}
          icon={faPlus}
        />
      </Stack>
    </Stack>
    <Stack
      direction="horizontal"
      gap={3}
      className="align-items-center resource-header-meta"
    >
      <span className="resource-header-type">Recreation Site</span>
    </Stack>
  </Stack>
);
