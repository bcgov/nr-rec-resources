import React from 'react';
import { GalleryAccordion } from './GalleryAccordion';

export const DocumentGallery = ({ documents }: { documents: any[] }) => (
  <GalleryAccordion
    eventKey="documents"
    title="Documents"
    description="Document formats only accept PDF at max file size 1mb."
    items={documents}
    uploadLabel={'Upload'}
    renderItem={(doc, idx) => (
      <div
        key={idx}
        style={{
          width: 200,
          height: 140,
          borderRadius: '10px',
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 2px #e0e0e0',
        }}
      >
        <div style={{ fontSize: '2.5rem', color: '#bdbdbd' }}>📄</div>
        <div style={{ fontWeight: 500, fontSize: '1rem', marginTop: 4 }}>
          {doc.name}
        </div>
        <div style={{ fontSize: '0.92rem', color: '#757575' }}>{doc.date}</div>
      </div>
    )}
  />
);
