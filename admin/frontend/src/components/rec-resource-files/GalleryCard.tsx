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

interface GalleryCardProps {
  topContent: React.ReactNode;
  filename: string;
  date: string;
  menu?: React.ReactNode;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  topContent,
  filename,
  date,
  menu = (
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
        <Dropdown.Item eventKey="view">
          <FontAwesomeIcon icon={faEye} className="me-2" /> View
        </Dropdown.Item>
        <Dropdown.Item eventKey="download">
          <FontAwesomeIcon icon={faCloudDownload} className="me-2" /> Download
        </Dropdown.Item>
        <Dropdown.Item eventKey="delete">
          <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" /> Delete
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  ),
}) => (
  <Card className="gallery-card p-0">
    <Card.Body className="gallery-card-top d-flex flex-column align-items-center justify-content-center p-0">
      <div className="gallery-card-top-hover">
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="tooltip-view">View</Tooltip>}
        >
          <Button variant="link">
            <FontAwesomeIcon icon={faEye} />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="tooltip-download">Download</Tooltip>}
        >
          <Button variant="link">
            <FontAwesomeIcon icon={faCloudDownload} />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="tooltip-delete">Delete</Tooltip>}
        >
          <Button variant="link">
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </OverlayTrigger>
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
        <Col xs="auto">{menu}</Col>
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
