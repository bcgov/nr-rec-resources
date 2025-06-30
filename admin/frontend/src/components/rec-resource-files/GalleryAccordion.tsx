import React from 'react';
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
  uploadLabel = '+ Upload',
}) => (
  <Accordion defaultActiveKey={eventKey} className="mb-4">
    <Accordion.Item eventKey={eventKey}>
      <Accordion.Header>
        <span style={{ fontWeight: 600, fontSize: '1.15rem' }}>
          {title} ({items.length})
        </span>
      </Accordion.Header>
      <Accordion.Body
        style={{
          background: '#fafbfc',
          borderRadius: 12,
          border: '1px solid #e0e0e0',
          padding: 24,
        }}
      >
        <div
          style={{
            marginBottom: '0.75rem',
            color: '#1976d2',
            fontSize: '0.98rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18, marginRight: 6 }}>ⓘ</span>
          {description}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          <div
            style={{
              width: 200,
              height: 140,
              border: '2px dashed #bdbdbd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              cursor: 'pointer',
              background: '#fff',
            }}
            onClick={onUploadClick}
          >
            <span
              style={{
                color: '#1976d2',
                fontWeight: 500,
                fontSize: 18,
              }}
            >
              {uploadLabel}
            </span>
          </div>
          {items.map(renderItem)}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
);
