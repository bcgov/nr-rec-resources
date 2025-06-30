import React from 'react';
import './Gallery.scss';
import { Accordion } from 'react-bootstrap';

interface GalleryAccordionProps {
  eventKey: string;
  title: string;
  description: string;
  items: any[];
  renderItem: (item: any, idx: number) => React.ReactNode;
  onUploadClick?: () => void;
  uploadLabel?: string;
}

export const GalleryAccordion: React.FC<GalleryAccordionProps> = ({
  eventKey,
  title,
  description,
  items,
  renderItem,
  onUploadClick,
  uploadLabel = 'Upload',
}) => (
  <Accordion defaultActiveKey={eventKey} className="mb-4">
    <Accordion.Item eventKey={eventKey}>
      <Accordion.Header>
        <span style={{ fontWeight: 600, fontSize: '1.15rem' }}>
          {title} ({items.length})
        </span>
      </Accordion.Header>
      <Accordion.Body className="p-4">
        <div className="gallery-accordion-description">
          <span className="gallery-accordion-info-icon">ⓘ</span>
          {description}
        </div>
        <div className="gallery-accordion-grid">
          <div className="gallery-upload-tile" onClick={onUploadClick}>
            <span className="gallery-upload-plus">+</span>
            <span className="gallery-upload-label">{uploadLabel}</span>
          </div>
          {items.map(renderItem)}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
);
