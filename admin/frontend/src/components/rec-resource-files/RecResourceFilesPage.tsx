import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { DocumentGallery } from "./DocumentGallery";
import { ImageGallery } from "./ImageGallery";
import { InfoBanner } from "./InfoBanner";
import "./RecResourceFilesPage.scss";
import { ResourceHeaderSection } from "./ResourceHeaderSection";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";

export const RecResourceFilesPage = () => {
  const params = useParams();
  const {
    data: documents,
    isFetching,
    error,
  } = useGetDocumentsByRecResourceId(`${params.id}`);

  // Mock data for demonstration
  const images = Array(10).fill({
    name: "File_Name.jpg",
    date: "06 Nov 2023, 02:45 PM",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // Replace with your image URLs
  });
  // const documents = Array(14).fill({
  //   name: 'File_Name.jpg',
  //   date: '06 Nov 2023, 02:45 PM',
  //   url: '#',
  // });

  const onImageAction = (
    action: "view" | "download" | "delete",
    file: { name: string; date: string; url: string },
  ) => {
    console.log(`${action} image:`, file);
  };

  const onDocumentAction = (
    action: "view" | "download" | "delete",
    file: RecreationResourceDocDto,
  ) => {
    console.log(`${action} file:`, file);
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
      <ImageGallery images={images} onAction={onImageAction} />
      <DocumentGallery documents={documents} onAction={onDocumentAction} />
    </Stack>
  );
};
