import React from 'react';
import { GalleryAccordion } from './GalleryAccordion';
import { GalleryCard } from './GalleryCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

export interface DocumentGalleryProps {
  documents: { name: string; date: string; url: string }[];
  onView: (file: { name: string; date: string; url: string }) => void;
  onDownload: (file: { name: string; date: string; url: string }) => void;
  onDelete: (file: { name: string; date: string; url: string }) => void;
}

export const DocumentGallery: React.FC<DocumentGalleryProps> = ({
  documents,
  onView,
  onDownload,
  onDelete,
}) => (
  <GalleryAccordion
    eventKey="documents"
    title="Public documents"
    description="Document formats only accept PDF at max file size 1mb."
    items={documents}
    uploadLabel={'Upload'}
    renderItem={(doc, idx) => (
      <GalleryCard
        key={idx}
        topContent={
          <FontAwesomeIcon icon={faFilePdf} size="2x" color="#d32f2f" />
        }
        filename={doc.name}
        date={doc.date}
        onView={() => onView(doc)}
        onDownload={() => onDownload(doc)}
        onDelete={() => onDelete(doc)}
      />
    )}
  />
);
