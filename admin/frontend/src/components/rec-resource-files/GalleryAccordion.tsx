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
      <Accordion.Body style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#eaf4fd',
            color: '#1976d2',
            borderRadius: 6,
            padding: '10px 16px',
            fontSize: 15,
            marginBottom: '1.1rem',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18, color: '#1976d2' }}>ⓘ</span>
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
              height: '100%',
              border: '1.5px dashed #d3d3d3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              cursor: 'pointer',
              background: '#fff',
              color: '#bdbdbd',
              fontSize: 22,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onClick={onUploadClick}
          >
            <span
              style={{
                fontSize: 36,
                lineHeight: 1,
                marginBottom: 10,
                color: '#bdbdbd',
                fontWeight: 300,
              }}
            >
              +
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#757575',
                fontWeight: 400,
                marginTop: 2,
              }}
            >
              Upload
            </span>
          </div>
          {items.map(renderItem)}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
);
