import { CustomButton } from '@/components';
import { EditableGuard } from '@/components/auth';
import { RecResourceFileSection } from '@/pages/rec-resource-page/components/RecResourceFileSection';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { InfoBanner } from '@/pages/rec-resource-page/components/shared/InfoBanner';
import { faEllipsisH, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { Dropdown, Stack } from 'react-bootstrap';
import './RecResourceFilesPage.scss';

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

const ActionButtonsSection = ({ isArchived }: { isArchived: boolean }) => {
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

      <EditableGuard isArchived={isArchived}>
        <>
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
                <Dropdown.Item
                  onClick={getImageGeneralActionHandler('upload')}
                  disabled={isImageUploadDisabled}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="me-2 rec-resource-files-page__action-button-icon"
                  />
                  Add image
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={getDocumentGeneralActionHandler('upload')}
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
              onClick={getImageGeneralActionHandler('upload')}
              disabled={isImageUploadDisabled}
            />
            <ActionButton
              label="Add document"
              onClick={getDocumentGeneralActionHandler('upload')}
              disabled={isDocumentUploadDisabled}
            />
          </Stack>
        </>
      </EditableGuard>
    </Stack>
  );
};

export const RecResourceFilesPage = () => {
  const { recResource } = useRecResource();
  const isArchived = recResource?.rec_status_code === 'AR';

  return (
    <Stack direction="vertical" gap={4}>
      <ActionButtonsSection isArchived={isArchived} />
      <EditableGuard isArchived={isArchived}>
        <InfoBanner>
          All images and documents will be published to the website within 15
          minutes.
        </InfoBanner>
      </EditableGuard>
      <RecResourceFileSection isArchived={isArchived} />
    </Stack>
  );
};
