import { ClampLines } from "@/components/clamp-lines";
import {
  faEllipsisV,
  faFilePdf,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useCallback } from "react";
import { Card, Col, Dropdown, Row, Stack } from "react-bootstrap";
import { GalleryAction, GalleryFile } from "../../../types";
import { ActionButton } from "./ActionButton";
import { CARD_ACTIONS } from "./constants";
import { DropdownActionItem } from "./DropdownActionItem";
import "./GalleryFileCard.scss";
import { LoadingState } from "./LoadingState";

export interface GalleryFileCardProps<T extends GalleryFile> {
  /** Optional content to display at the top of the card */
  topContent?: React.ReactNode;
  /** File object to display */
  file: T;
  /** Callback for when an action is triggered */
  onAction: (action: GalleryAction, file: T) => void;
}

/**
 * Displays a file card with actions and status.
 */
export const GalleryFileCard = <T extends GalleryFile>({
  topContent,
  file,
  onAction,
}: GalleryFileCardProps<T>) => {
  const handleAction = useCallback(
    (action: GalleryAction) => onAction(action, file),
    [onAction, file],
  );

  const isUploadError = Boolean(file.uploadFailed);
  const isUploading = Boolean(file.isUploading);
  const isDownloading = Boolean(file.isDownloading);
  const isDeleting = Boolean(file.isDeleting);
  const isPending = isUploading || isDownloading || isDeleting;

  const renderTopContent = () => {
    if (isUploadError) {
      return (
        <Stack
          direction="vertical"
          gap={2}
          className="align-items-center justify-content-center"
        >
          <FontAwesomeIcon
            icon={faFilePdf}
            size="2x"
            className="fa-file-pdf"
            aria-hidden="true"
          />
          <span>Upload Failed</span>
          <div className="gallery-file-card__top-hover">
            <ActionButton
              icon={faRedo}
              label="Retry"
              onClick={() => handleAction("retry")}
            />
          </div>
        </Stack>
      );
    }

    if (isPending) {
      return (
        <LoadingState
          label={
            isUploading
              ? "Uploading"
              : isDownloading
                ? "Downloading"
                : "Deleting"
          }
        />
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
        {topContent}
      </>
    );
  };

  return (
    <Card
      className={clsx("gallery-file-card p-0", {
        "gallery-file-card--error": isUploadError,
      })}
    >
      <Card.Body
        className={clsx(
          "gallery-file-card__top d-flex flex-column align-items-center justify-content-center p-0",
          {
            "gallery-file-card__top--error": isUploadError,
            "gallery-file-card__top--pending": !isUploadError && isPending,
          },
        )}
      >
        {renderTopContent()}
      </Card.Body>

      <Card.Body className="gallery-file-card__body d-flex flex-column gap-1 pt-2 pb-2">
        <Row className="gallery-file-card__row align-items-center">
          <Col
            className={clsx("gallery-file-card__filename fw-bold", {
              "gallery-file-card__filename--error": isUploadError,
            })}
            xs={8}
          >
            <ClampLines
              text={file.name || "Untitled"}
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
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {isUploadError ? (
                  <DropdownActionItem
                    icon={faRedo}
                    label="Retry"
                    onClick={() => handleAction("retry")}
                  />
                ) : (
                  CARD_ACTIONS.map(({ key, icon, label }) => (
                    <DropdownActionItem
                      key={key}
                      icon={icon}
                      label={label}
                      onClick={() => handleAction(key)}
                    />
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        <div
          className={clsx(
            "gallery-file-card__date",
            isUploadError ? "gallery-file-card__date--error" : "text-muted",
          )}
        >
          {file.date || "-"}
        </div>
      </Card.Body>
    </Card>
  );
};
