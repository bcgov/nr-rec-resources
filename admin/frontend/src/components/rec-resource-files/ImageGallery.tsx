import React from 'react';
import { GalleryAccordion } from './GalleryAccordion';
import { GalleryCard } from './GalleryCard';
import { Image } from 'react-bootstrap';

export const ImageGallery = ({ images }: { images: any[] }) => (
  <GalleryAccordion
    eventKey="images"
    title="Public images"
    description="Image formats JPG, HEIC at max file size 10mb. Maximum 10 images."
    items={images}
    uploadLabel={'Upload'}
    renderItem={(img, idx) => (
      <GalleryCard
        key={idx}
        topContent={
          <Image src={img.url} alt={img.name} width={'100%'} height={'100%'} />
        }
        filename={img.name}
        date={img.date}
      />
    )}
  />
);
