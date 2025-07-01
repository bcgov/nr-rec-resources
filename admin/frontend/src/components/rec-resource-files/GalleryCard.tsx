import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCloudDownload,
  faTrash,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import './Gallery.scss';

export interface GalleryCardProps {
  topContent?: React.ReactNode;
  filename: string;
  date: string;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const cardActions = [
  { key: 'view', icon: faEye, label: 'View', className: '' },
  { key: 'download', icon: faCloudDownload, label: 'Download', className: '' },
  { key: 'delete', icon: faTrash, label: 'Delete', className: 'text-danger' },
];

export const GalleryCard: React.FC<GalleryCardProps> = ({
  topContent,
  filename,
  date,
  onView,
  onDownload,
  onDelete,
}) => {
  // Map action keys to handlers
  const actionHandlers: Record<string, (() => void) | undefined> = {
    view: onView,
    download: onDownload,
    delete: onDelete,
  };

  return (
    <Card className="gallery-card p-0">
      <Card.Body className="gallery-card-top d-flex flex-column align-items-center justify-content-center p-0">
        <div className="gallery-card-top-hover">
          {cardActions.map(({ key, icon, label }) => (
            <OverlayTrigger
              key={key}
              placement="bottom"
              overlay={<Tooltip id={`tooltip-${key}`}>{label}</Tooltip>}
            >
              <Button variant="link" onClick={actionHandlers[key]}>
                <FontAwesomeIcon icon={icon} />
              </Button>
            </OverlayTrigger>
          ))}
        </div>
        {topContent}
      </Card.Body>
      <Card.Body
        className="gallery-card-body d-flex flex-column gap-1 pt-2 pb-2"
        style={{ borderTop: '1px solid var(--bs-border-color-translucent)' }}
      >
        <Row className="gallery-card-row align-items-center justify-content-between">
          <Col className="gallery-card-filename fw-bold" xs="auto">
            {filename}
          </Col>
          <Col xs="auto">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="gallery-card-menu p-0 border-0 shadow-none"
                style={{ color: 'inherit' }}
                as="span"
              >
                <FontAwesomeIcon icon={faEllipsisH} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {cardActions.map(({ key, icon, label, className }) => (
                  <Dropdown.Item
                    eventKey={key}
                    key={key}
                    onClick={actionHandlers[key]}
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      className={`me-2 ${className}`}
                    />
                    {label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        <div
          className="gallery-card-date text-muted"
          style={{ fontSize: '0.92rem' }}
        >
          {date}
        </div>
      </Card.Body>
    </Card>
  );
};
