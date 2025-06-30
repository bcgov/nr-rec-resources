import React from 'react';
import { GalleryAccordion } from './GalleryAccordion';

export const ImageGallery = ({ images }: { images: any[] }) => (
  <GalleryAccordion
    eventKey="images"
    title="Images"
    description="Image formats JPG, HEIC at max file size 10mb. Maximum 10 images."
    items={images}
    uploadLabel={'Upload'}
    renderItem={(img, idx) => (
      <div
        key={idx}
        style={{
          width: 200,
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#f5f5f5',
          boxShadow: '0 1px 2px #e0e0e0',
        }}
      >
        <img
          src={img.url}
          alt={img.name}
          style={{ width: '100%', height: 100, objectFit: 'cover' }}
        />
        <div style={{ padding: '0.5rem 0.75rem' }}>
          <div style={{ fontWeight: 500, fontSize: 15 }}>{img.name}</div>
          <div style={{ fontSize: '0.92rem', color: '#757575' }}>
            {img.date}
          </div>
        </div>
      </div>
    )}
  />
);
