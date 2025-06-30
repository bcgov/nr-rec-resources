import React from 'react';
import { ResourceHeaderSection } from './ResourceHeaderSection';
import { InfoBanner } from './InfoBanner';
import { ImageGallery } from './ImageGallery';
import { DocumentGallery } from './DocumentGallery';

export const RecResourceFilesPage = () => {
  // Mock data for demonstration
  const images = Array(10).fill({
    name: 'File_Name.jpg',
    date: '06 Nov 2023, 02:45 PM',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Replace with your image URLs
  });
  const documents = Array(14).fill({
    name: 'File_Name.jpg',
    date: '06 Nov 2023, 02:45 PM',
    url: '#',
  });

  return (
    <div className="rec-resource-files-page p-5">
      <ResourceHeaderSection name="Snow Creek" recId="REC2214" />
      <InfoBanner>
        All images and documents will be published to the beta website
        immediately.
      </InfoBanner>
      <ImageGallery images={images} />
      <DocumentGallery documents={documents} />
    </div>
  );
};
