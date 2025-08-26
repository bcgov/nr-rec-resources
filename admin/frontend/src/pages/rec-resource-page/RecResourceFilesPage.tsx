import { CustomButton } from "@/components";
import { RecResourceFileSection } from "@/pages/rec-resource-page/components/RecResourceFileSection";
import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import {
  faEllipsisH,
  faInfoCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Alert, Dropdown, Stack } from "react-bootstrap";
import "./RecResourceFilesPage.scss";

const InfoBanner = () => (
  <Alert variant="warning" className="rec-resource-page__info-banner">
    <Stack direction="horizontal" gap={2}>
      <FontAwesomeIcon
        className="rec-resource-page__info-banner-icon"
        icon={faInfoCircle}
        aria-label="Information"
      />
      <span className="rec-resource-page__info-banner-text">
        All images and documents will be published to the beta website within 15
        minutes.
      </span>
    </Stack>
  </Alert>
);

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
    className="rec-resource-files-page__action-button"
    disabled={disabled}
    leftIcon={
      <FontAwesomeIcon
        className="rec-resource-files-page__action-button-icon"
        icon={faPlus}
      />
    }
  >
    {label}
  </CustomButton>
);

const ActionButtonsSection = () => {
  const {
    isDocumentUploadDisabled,
    isImageUploadDisabled,
    getDocumentGeneralActionHandler,
    getImageGeneralActionHandler,
  } = useRecResourceFileTransferState();

  return (
    <Stack
      direction="horizontal"
      gap={2}
      className="justify-content-between align-items-center"
    >
      <h2 className="mb-0">Files</h2>

      {/* Responsive actions: dropdown on mobile, buttons on desktop */}
      {/* Mobile: show dropdown */}
      <div className="d-flex d-lg-none align-items-center">
        <Dropdown align="end">
          <Dropdown.Toggle
            as="span"
            id="rec-resource-files-actions-dropdown"
            className="rec-resource-files-page__ellipsis-toggle no-caret"
            aria-label="File actions menu"
          >
            <FontAwesomeIcon
              icon={faEllipsisH}
              size="lg"
              className="rec-resource-files-page__ellipsis-icon"
            />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={getImageGeneralActionHandler("upload")}>
              <FontAwesomeIcon
                icon={faPlus}
                className="me-2 rec-resource-files-page__action-button-icon"
              />
              Add image
            </Dropdown.Item>
            <Dropdown.Item
              onClick={getDocumentGeneralActionHandler("upload")}
              disabled={isDocumentUploadDisabled}
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="me-2 rec-resource-files-page__action-button-icon"
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
        className="py-2 rec-resource-files-page__action-buttons align-items-center d-none d-lg-flex"
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
  );
};

export const RecResourceFilesPage = () => {
  return (
    <Stack direction="vertical" gap={4}>
      <ActionButtonsSection />
      <InfoBanner />
      <RecResourceFileSection />
    </Stack>
  );
};
