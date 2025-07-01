import React from 'react';
import { GalleryAccordion } from './GalleryAccordion';
import { GalleryCard } from './GalleryCard';
import { Image } from 'react-bootstrap';

export interface ImageGalleryProps {
  images: { name: string; date: string; url: string }[];
  onView: (file: { name: string; date: string; url: string }) => void;
  onDownload: (file: { name: string; date: string; url: string }) => void;
  onDelete: (file: { name: string; date: string; url: string }) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onView,
  onDownload,
  onDelete,
}) => (
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
        onView={() => onView(img)}
        onDownload={() => onDownload(img)}
        onDelete={() => onDelete(img)}
      />
    )}
  />
);
