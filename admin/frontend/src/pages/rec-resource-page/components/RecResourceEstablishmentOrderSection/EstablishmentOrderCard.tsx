import { ClampLines } from '@/components/clamp-lines';
import { EstablishmentOrderDocDto } from '@/services';
import { COLOR_RED } from '@/styles/colors';
import {
  faCloudDownload,
  faEllipsisV,
  faEye,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { Card, Col, Dropdown, Row, Spinner, Stack } from 'react-bootstrap';
import '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/GalleryFileCard.scss';

export type EstablishmentOrderAction = 'view' | 'download';

interface EstablishmentOrderCardProps {
  doc: EstablishmentOrderDocDto;
  onAction: (
    action: EstablishmentOrderAction,
    doc: EstablishmentOrderDocDto,
  ) => void;
  isDownloading?: boolean;
}

const CARD_ACTIONS: ReadonlyArray<{
  key: EstablishmentOrderAction;
  icon: any;
  label: string;
}> = [
  { key: 'view', icon: faEye, label: 'View' },
  { key: 'download', icon: faCloudDownload, label: 'Download' },
] as const;

const ActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) => (
  <Stack
    direction="vertical"
    gap={2}
    className="align-items-center justify-content-center gallery-file-card__action-button-container"
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label={label}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <span>
      <FontAwesomeIcon icon={icon} />
    </span>
    <span>{label}</span>
  </Stack>
);

const DropdownActionItem = ({
  icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) => (
  <Dropdown.Item onClick={onClick}>
    <FontAwesomeIcon icon={icon} className="me-2" />
    {label}
  </Dropdown.Item>
);

export const EstablishmentOrderCard = ({
  doc,
  onAction,
  isDownloading = false,
}: EstablishmentOrderCardProps) => {
  const handleAction = (action: EstablishmentOrderAction) => {
    onAction(action, doc);
  };

  const renderTopContent = () => {
    if (isDownloading) {
      return (
        <Stack
          direction="vertical"
          gap={2}
          className="align-items-center justify-content-center"
        >
          <Spinner
            animation="border"
            role="status"
            aria-label="Downloading in progress"
          />
          <span>Downloading</span>
        </Stack>
      );
    }

    return (
      <>
        <Stack direction="horizontal" className="gallery-file-card__top-hover">
          {CARD_ACTIONS.map(({ key, icon, label }) => (
            <ActionButton
              key={key}
              icon={icon}
              label={label}
              onClick={() => handleAction(key)}
            />
          ))}
        </Stack>
        <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
      </>
    );
  };

  const displayDate = doc.created_at
    ? new Date(doc.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  return (
    <Card className="gallery-file-card p-0">
      <Card.Body
        className={clsx(
          'gallery-file-card__top d-flex flex-column align-items-center justify-content-center p-0',
          {
            'gallery-file-card__top--pending': isDownloading,
          },
        )}
      >
        {renderTopContent()}
      </Card.Body>

      <Card.Body className="gallery-file-card__body d-flex flex-column gap-1 pt-2 pb-2">
        <Row className="gallery-file-card__row align-items-center">
          <Col className="gallery-file-card__filename fw-bold" xs={8}>
            <ClampLines
              text={doc.title || 'Untitled'}
              lines={2}
              as="span"
              className="gallery-file-card__filename-ellipsis"
              placement="top"
            />
          </Col>

          <Col xs="auto" className="ms-auto">
            <Dropdown align="start">
              <Dropdown.Toggle
                variant="link"
                className="gallery-file-card__menu p-0 border-0 shadow-none"
                aria-label="File actions menu"
                disabled={isDownloading}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {CARD_ACTIONS.map(({ key, icon, label }) => (
                  <DropdownActionItem
                    key={key}
                    icon={icon}
                    label={label}
                    onClick={() => handleAction(key)}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        <div className="gallery-file-card__date text-muted">{displayDate}</div>
      </Card.Body>
    </Card>
  );
};
