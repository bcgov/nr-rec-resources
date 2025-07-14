import clsx from "clsx";
import {
  Card,
  Row,
  Col,
  Dropdown,
  Button,
  Stack,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudDownload,
  faEllipsisV,
  faEye,
  faTrash,
  faFilePdf,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import "./GalleryFileCard.scss";
import { GalleryFile, GalleryAction } from "../../types";
import { ClampLines } from "@/components/clamp-lines";

export interface GalleryFileCardProps<T extends GalleryFile> {
  /** Optional content to display at the top of the card */
  topContent?: React.ReactNode;
  /** File object to display */
  file: T;
  /** Callback for when an action is triggered */
  onAction: (action: GalleryAction, file: T) => void;
}

/**
 * List of available actions for the file card.
 */
const CARD_ACTIONS: {
  key: GalleryAction;
  icon: any;
  label: string;
}[] = [
  { key: "view", icon: faEye, label: "View" },
  { key: "download", icon: faCloudDownload, label: "Download" },
  { key: "delete", icon: faTrash, label: "Delete" },
];

/**
 * Displays a file card with actions and status.
 *
 * - Shows file name, date, and status (uploading, error, etc.)
 * - Provides action buttons (view, download, delete) with tooltips
 * - Handles error and pending states with clear UI feedback
 */
export const GalleryFileCard = <T extends GalleryFile>({
  topContent,
  file,
  onAction,
}: GalleryFileCardProps<T>) => {
  // Determine error and pending states for the file
  const isFileUploadError = Boolean(file.uploadFailed);
  const isFileDownloadPending = Boolean(file.isUploading);

  // Fallbacks for missing file data
  const filename = file.name || "Untitled";
  const date = file.date || "-";

  return (
    <Card
      className={clsx("gallery-file-card p-0", {
        // Highlight card if upload failed
        "gallery-file-card--error": isFileUploadError,
      })}
    >
      <Card.Body
        className={clsx(
          "gallery-file-card__top d-flex flex-column align-items-center justify-content-center p-0",
          {
            // Show error or pending style as needed
            "gallery-file-card__top--error": isFileUploadError,
            "gallery-file-card__top--pending":
              !isFileUploadError && isFileDownloadPending,
          },
        )}
      >
        {/* Error state: show error icon and message */}
        {isFileUploadError ? (
          <Stack
            direction="vertical"
            gap={2}
            className="align-items-center justify-content-center"
          >
            <FontAwesomeIcon
              icon={faFilePdf}
              size="2x"
              className="fa-file-pdf"
            />
            <span>Upload Failed</span>
            {/* Overlay with retry icon and label */}
            <div className="gallery-file-card__top-hover">
              <Stack
                direction="vertical"
                gap={2}
                className="align-items-center justify-content-center gallery-file-card__action-button-container"
              >
                <Button
                  variant="link"
                  onClick={() => onAction("retry", file)}
                  aria-label="Retry"
                >
                  <FontAwesomeIcon icon={faRedo} />
                </Button>
                <span>Retry</span>
              </Stack>
            </div>
          </Stack>
        ) : isFileDownloadPending ? (
          // Pending state: show spinner and uploading message
          <Stack
            direction="vertical"
            gap={2}
            className="align-items-center justify-content-center"
          >
            <Spinner />
            <span>Uploading</span>
          </Stack>
        ) : (
          // Normal state: show action buttons and top content
          <>
            <Stack
              direction="horizontal"
              className="gallery-file-card__top-hover"
            >
              {CARD_ACTIONS.map(({ key, icon, label }) => (
                <Stack
                  direction="vertical"
                  gap={2}
                  className="align-items-center justify-content-center gallery-file-card__action-button-container"
                  onClick={() => onAction(key, file)}
                  key={key}
                >
                  <Button variant="link" aria-label={label}>
                    <FontAwesomeIcon icon={icon} />
                  </Button>
                  <span>{label}</span>
                </Stack>
              ))}
            </Stack>
            {topContent}
          </>
        )}
      </Card.Body>
      <Card.Body className="gallery-file-card__body d-flex flex-column gap-1 pt-2 pb-2">
        <Row className="gallery-file-card__row align-items-center">
          <Col
            className={clsx("gallery-file-card__filename fw-bold", {
              // Highlight filename if upload failed
              "gallery-file-card__filename--error": isFileUploadError,
            })}
            xs={8}
          >
            <ClampLines
              text={filename}
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
                disabled={isFileDownloadPending}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {isFileUploadError ? (
                  <Dropdown.Item
                    eventKey="retry"
                    key="retry"
                    onClick={() => onAction("retry", file)}
                  >
                    <Stack
                      direction="horizontal"
                      gap={2}
                      className="align-items-center"
                    >
                      <FontAwesomeIcon icon={faRedo} />
                      <span>Retry</span>
                    </Stack>
                  </Dropdown.Item>
                ) : (
                  CARD_ACTIONS.map(({ key, icon, label }) => (
                    <Dropdown.Item
                      eventKey={key}
                      key={key}
                      onClick={() => onAction(key, file)}
                    >
                      <Stack
                        direction="horizontal"
                        gap={2}
                        className="align-items-center"
                      >
                        <FontAwesomeIcon icon={icon} />
                        <span>{label}</span>
                      </Stack>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        <div
          className={clsx(
            "gallery-file-card__date",
            isFileUploadError ? "gallery-file-card__date--error" : "text-muted",
          )}
        >
          {date}
        </div>
      </Card.Body>
    </Card>
  );
};
