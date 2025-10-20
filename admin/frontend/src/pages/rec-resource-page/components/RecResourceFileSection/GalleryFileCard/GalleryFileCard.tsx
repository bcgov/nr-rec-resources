import { ClampLines } from '@/components/clamp-lines';
import {
  GalleryFile,
  GalleryFileAction,
} from '@/pages/rec-resource-page/types';
import {
  faCancel,
  faEllipsisV,
  faFileImage,
  faFilePdf,
  faRedo,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { Card, Col, Dropdown, Row, Stack } from 'react-bootstrap';
import { ActionButton } from './ActionButton';
import { CARD_ACTIONS } from './constants';
import { DropdownActionItem } from './DropdownActionItem';
import './GalleryFileCard.scss';
import { LoadingState } from './LoadingState';

/**
 * Props for the `GalleryFileCard` component.
 *
 * @typeParam T - The type of the file, extending `GalleryFile`.
 *
 * @property {React.ReactNode} [topContent] - Optional content to display at the top of the card.
 * @property {T} file - File object to display.
 * @property {(action: GalleryFileAction, file: T) => () => void} getFileActionHandler -
 *   Function that returns an event handler for a given file action and file.
 * @property {typeof CARD_ACTIONS} [actions] - Optional custom actions to display. Defaults to CARD_ACTIONS.
 */
export interface GalleryFileCardProps<T extends GalleryFile> {
  topContent?: React.ReactNode;
  file: T;
  getFileActionHandler: (action: GalleryFileAction, file: T) => () => void;
  actions?: typeof CARD_ACTIONS;
}

/**
 * Displays a file card with actions and status.
 */
export const GalleryFileCard = <T extends GalleryFile>({
  topContent,
  file,
  getFileActionHandler,
  actions = CARD_ACTIONS,
}: GalleryFileCardProps<T>) => {
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
            icon={file.type === 'document' ? faFilePdf : faFileImage}
            size="2x"
            className="fa-file-pdf"
            aria-hidden="true"
          />
          <span>Upload Failed</span>
          <div className="gallery-file-card__top-hover">
            <ActionButton
              icon={faRedo}
              label="Retry"
              onClick={getFileActionHandler('retry', file)}
            />
            <ActionButton
              icon={faCancel}
              label="Dismiss"
              onClick={getFileActionHandler('dismiss', file)}
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
              ? 'Uploading'
              : isDownloading
                ? 'Downloading'
                : 'Deleting'
          }
        />
      );
    }

    return (
      <>
        <Stack direction="horizontal" className="gallery-file-card__top-hover">
          {actions.map(({ key, icon, label }) => (
            <ActionButton
              key={key}
              icon={icon}
              label={label}
              onClick={getFileActionHandler(key, file)}
            />
          ))}
        </Stack>
        {topContent}
      </>
    );
  };

  return (
    <Card
      className={clsx('gallery-file-card p-0', {
        'gallery-file-card--error': isUploadError,
      })}
    >
      <Card.Body
        className={clsx(
          'gallery-file-card__top d-flex flex-column align-items-center justify-content-center p-0',
          {
            'gallery-file-card__top--error': isUploadError,
            'gallery-file-card__top--pending': !isUploadError && isPending,
          },
        )}
      >
        {renderTopContent()}
      </Card.Body>

      <Card.Body className="gallery-file-card__body d-flex flex-column gap-1 pt-2 pb-2">
        <Row className="gallery-file-card__row align-items-center">
          <Col
            className={clsx('gallery-file-card__filename fw-bold', {
              'gallery-file-card__filename--error': isUploadError,
            })}
            xs={8}
          >
            <ClampLines
              text={file.name || 'Untitled'}
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
                  <>
                    <DropdownActionItem
                      icon={faRedo}
                      label="Retry"
                      onClick={getFileActionHandler('retry', file)}
                    />
                    <DropdownActionItem
                      icon={faTimes}
                      label="Dismiss"
                      onClick={getFileActionHandler('dismiss', file)}
                    />
                  </>
                ) : (
                  actions.map(({ key, icon, label }) => (
                    <DropdownActionItem
                      key={key}
                      icon={icon}
                      label={label}
                      onClick={getFileActionHandler(key, file)}
                    />
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        <div
          className={clsx(
            'gallery-file-card__date',
            isUploadError ? 'gallery-file-card__date--error' : 'text-muted',
          )}
        >
          {file.date || '-'}
        </div>
      </Card.Body>
    </Card>
  );
};
