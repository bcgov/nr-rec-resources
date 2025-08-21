import { CustomBadge, CustomButton } from "@/components";
import { ClampLines } from "@/components/clamp-lines";
import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import {
  COLOR_BLUE,
  COLOR_BLUE_LIGHT,
  COLOR_GREEN,
  COLOR_WHITE,
} from "@/styles/colors";
import { faEllipsisH, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Dropdown, Stack } from "react-bootstrap";
import "./ResourceHeaderSection.scss";
import { RecreationResourceDetailUIModel } from "@/services/recreation-resource-admin";

interface ResourceHeaderSectionProps {
  recResource: RecreationResourceDetailUIModel;
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
  const {
    isDocumentUploadDisabled,
    isImageUploadDisabled,
    getDocumentGeneralActionHandler,
    getImageGeneralActionHandler,
  } = useRecResourceFileTransferState();

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
          {recResource.recreation_status_description && (
            <CustomBadge
              label={recResource.recreation_status_description!}
              bgColor={COLOR_GREEN}
              textColor={COLOR_WHITE}
            />
          )}
        </Stack>

        {/* Responsive actions: dropdown on mobile, buttons on desktop */}
        {/* Mobile: show dropdown */}
        <div className="d-flex d-lg-none align-items-center">
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
              <Dropdown.Item onClick={getImageGeneralActionHandler("upload")}>
                <FontAwesomeIcon
                  icon={faPlus}
                  className="me-2 resource-header-section__action-button-icon"
                />
                Add image
              </Dropdown.Item>
              <Dropdown.Item
                onClick={getDocumentGeneralActionHandler("upload")}
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
          className="py-2 resource-header-section__action-buttons align-items-center d-none d-lg-flex"
        >
          <ActionButton
            label="Add image"
            onClick={getImageGeneralActionHandler("upload")}
            disabled={isImageUploadDisabled}
          />
          <ActionButton
            label="Add document"
            onClick={getDocumentGeneralActionHandler("upload")}
            disabled={isDocumentUploadDisabled}
          />
        </Stack>
      </Stack>
      <span className="fw-bold">{recResource.rec_resource_type}</span>
    </Stack>
  );
};
