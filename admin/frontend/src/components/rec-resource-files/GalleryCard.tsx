import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import './Gallery.scss';

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
  menu = <span className="gallery-card-menu">•••</span>,
}) => (
  <Card className="gallery-card p-0 h-100">
    <Card.Body
      className="gallery-card-top d-flex flex-column align-items-center justify-content-center p-0"
      style={{ background: undefined, height: 140 }}
    >
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
