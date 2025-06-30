import React from 'react';
import { GalleryAccordion } from './GalleryAccordion';
import { GalleryCard } from './GalleryCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

export const DocumentGallery = ({ documents }: { documents: any[] }) => (
  <GalleryAccordion
    eventKey="documents"
    title="Documents"
    description="Document formats only accept PDF at max file size 1mb."
    items={documents}
    uploadLabel={'Upload'}
    renderItem={(doc, idx) => (
      <GalleryCard
        key={idx}
        topContent={
          <>
            <FontAwesomeIcon icon={faFilePdf} size="2x" color="#d32f2f" />
            <span className="pdf-label">PDF</span>
          </>
        }
        filename={doc.name}
        date={doc.date}
      />
    )}
  />
);
