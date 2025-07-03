import React from "react";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryCard } from "./GalleryCard";
import { Image } from "react-bootstrap";

export interface ImageGalleryImage {
  name: string;
  date: string;
  url: string;
  tempId?: string;
}

export interface ImageGalleryProps {
  images: ImageGalleryImage[];
  onAction: (
    action: "view" | "download" | "delete" | "add",
    file: ImageGalleryImage,
  ) => void;
  isLoading?: boolean;
  onUploadClick?: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onAction,
  isLoading = false,
  onUploadClick,
}) => (
  <GalleryAccordion
    eventKey="images"
    title="Public images"
    description="Image formats JPG, HEIC at max file size 10mb. Maximum 10 images."
    items={images}
    uploadLabel={"Upload"}
    isLoading={isLoading}
    onUploadClick={onUploadClick}
    renderItem={(img, idx) => (
      <GalleryCard<{
        name: string;
        date: string;
        url: string;
        tempId?: string;
        isDownlading?: boolean;
        isDownloadError?: boolean;
      }>
        key={img.tempId || idx}
        topContent={
          <Image src={img.url} alt={img.name} width={"100%"} height={"100%"} />
        }
        filename={img.name}
        date={img.date}
        file={img}
        onAction={onAction}
      />
    )}
  />
);
