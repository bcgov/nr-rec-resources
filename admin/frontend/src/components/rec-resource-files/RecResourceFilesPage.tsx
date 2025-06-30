import React from 'react';
import { ResourceHeader } from './ResourceHeader';
import { UploadSection } from './UploadSection';
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
    <div className="rec-resource-files-page">
      <ResourceHeader name="Snow Creek" recId="REC2214" />
      <UploadSection />
      <ImageGallery images={images} />
      <DocumentGallery documents={documents} />
    </div>
  );
};
