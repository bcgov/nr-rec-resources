import React from 'react';
import { GalleryAccordion } from './GalleryAccordion';
import { GalleryCard } from './GalleryCard';

export const ImageGallery = ({ images }: { images: any[] }) => (
  <GalleryAccordion
    eventKey="images"
    title="Images"
    description="Image formats JPG, HEIC at max file size 10mb. Maximum 10 images."
    items={images}
    uploadLabel={'Upload'}
    renderItem={(img, idx) => (
      <GalleryCard
        key={idx}
        topContent={
          <img
            src={img.url}
            alt={img.name}
            style={{ width: '100%', height: 100, objectFit: 'cover' }}
          />
        }
        filename={img.name}
        date={img.date}
      />
    )}
  />
);
