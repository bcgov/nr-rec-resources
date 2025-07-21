import { CustomBadge, CustomButton } from "@/components";
import { ClampLines } from "@/components/clamp-lines";
import { RecreationResourceDetailModel } from "@/custom-models";
import { handleAddPdfFileClick } from "@/pages/rec-resource-page/helpers";
import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { COLOR_BLUE, COLOR_BLUE_LIGHT } from "@/styles/colors";
import { faEllipsisH, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Dropdown, Stack } from "react-bootstrap";
import "./ResourceHeaderSection.scss";

interface ResourceHeaderSectionProps {
  recResource: RecreationResourceDetailModel;
}

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => (
  <CustomButton
    variant="outline-primary"
    onClick={onClick}
    className="resource-header-section__action-button"
    disabled={disabled}
    leftIcon={
      <FontAwesomeIcon
        className="resource-header-section__action-button-icon"
        icon={faPlus}
      />
    }
  >
    {label}
  </CustomButton>
);

export const ResourceHeaderSection: FC<ResourceHeaderSectionProps> = ({
  recResource,
}) => {
  const { isDocumentUploadDisabled } = useRecResourceFileTransferState();

  return (
    <Stack direction="vertical" className="resource-header-section" gap={2}>
      {/* section: name, rec id, status, and action buttons */}
      <Stack direction="horizontal" gap={2} className="justify-content-between">
        {/* name, rec id, and badge */}
        <Stack direction="horizontal" gap={2} className="flex-wrap">
          <div className="resource-header-section__title-wrapper">
            <ClampLines
              text={recResource.name}
              as="h1"
              className="resource-header-section__title-text"
            />
          </div>
          <CustomBadge
            label={recResource.rec_resource_id}
            bgColor={COLOR_BLUE_LIGHT}
            textColor={COLOR_BLUE}
          />
        </Stack>

        {/* Responsive actions: dropdown on mobile, buttons on desktop */}
        {/* Mobile: show dropdown */}
        <div className="d-flex d-md-none align-items-center">
          <Dropdown align="end">
            <Dropdown.Toggle
              as="span"
              id="resource-header-actions-dropdown"
              className="resource-header-section__ellipsis-toggle no-caret"
              aria-label="Resource actions menu"
            >
              <FontAwesomeIcon
                icon={faEllipsisH}
                size="lg"
                className="resource-header-section__ellipsis-icon"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleAddPdfFileClick}>
                <FontAwesomeIcon
                  icon={faPlus}
                  className="me-2 resource-header-section__action-button-icon"
                />
                Add image
              </Dropdown.Item>
              <Dropdown.Item
                onClick={handleAddPdfFileClick}
                disabled={isDocumentUploadDisabled}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  className="me-2 resource-header-section__action-button-icon"
                />
                Add document
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {/* Desktop: show buttons */}
        <Stack
          direction="horizontal"
          gap={2}
          className="py-2 resource-header-section__action-buttons align-items-center d-none d-md-flex"
        >
          <ActionButton label="Add image" onClick={handleAddPdfFileClick} />
          <ActionButton
            label="Add document"
            onClick={handleAddPdfFileClick}
            disabled={isDocumentUploadDisabled}
          />
        </Stack>
      </Stack>
      <span className="fw-bold">{recResource.rec_resource_type}</span>
    </Stack>
  );
};
