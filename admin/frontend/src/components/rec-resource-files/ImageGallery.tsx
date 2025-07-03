import React from "react";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryCard } from "./GalleryCard";
import { Image } from "react-bootstrap";
import { GalleryImage } from "./types";

export interface ImageGalleryProps {
  images: GalleryImage[];
  onAction: (
    action: "view" | "download" | "delete" | "add",
    file: GalleryImage,
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
    renderItem={(img) => (
      <GalleryCard<GalleryImage>
        key={img.id}
        topContent={
          <Image src={img.url} alt={img.name} width={"100%"} height={"100%"} />
        }
        file={img}
        onAction={onAction}
      />
    )}
  />
);
