import { useGetDocumentsByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId';
import { RecreationResourceDocDto } from '@/services/recreation-resource-admin';
import { downloadUrlAsFile } from '@/utils/fileUtils';
import { Stack } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { DocumentGallery } from './DocumentGallery';
import { ImageGallery } from './ImageGallery';
import { InfoBanner } from './InfoBanner';
import './RecResourceFilesPage.scss';
import { ResourceHeaderSection } from './ResourceHeaderSection';

export const RecResourceFilesPage = () => {
  const params = useParams();
  const {
    data: documents,
    isFetching,
    error,
  } = useGetDocumentsByRecResourceId(`${params.id}`);

  // todo: replace mock data with api call
  const images = Array(10).fill({
    name: 'File_Name.jpg',
    date: '06 Nov 2023, 02:45 PM',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Replace with your image URLs
  });

  const onImageAction = (
    action: 'view' | 'download' | 'delete',
    file: { name: string; date: string; url: string },
  ) => {
    console.log(`${action} image:`, file);
  };

  const onDocumentAction = (
    action: 'view' | 'download' | 'delete',
    file: RecreationResourceDocDto,
  ) => {
    if (action === 'view' && file.url) {
      window.open(file.url, '_blank');
    }
    if (action === 'download' && file.url) {
      downloadUrlAsFile(file.url, file.title || 'document');
    }
  };

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-files-page py-4"
    >
      <ResourceHeaderSection name="Snow Creek" recId="REC2214" />
      <InfoBanner>
        All images and documents will be published to the beta website
        immediately.
      </InfoBanner>
      <ImageGallery
        images={images}
        onAction={onImageAction}
        isLoading={isFetching}
      />
      <DocumentGallery
        documents={documents}
        onAction={onDocumentAction}
        isLoading={isFetching}
      />
    </Stack>
  );
};
