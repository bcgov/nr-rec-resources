import React from "react";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryCard } from "./GalleryCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { GalleryDocument } from "./types";

export interface DocumentGalleryProps {
  documents: GalleryDocument[];
  onAction: (
    action: "view" | "download" | "delete" | "add",
    file: GalleryDocument,
  ) => void;
  isLoading?: boolean;
  onUploadClick?: () => void;
}

export const DocumentGallery: React.FC<DocumentGalleryProps> = ({
  documents,
  onAction,
  isLoading = false,
  onUploadClick,
}) => (
  <GalleryAccordion
    eventKey="documents"
    title="Public documents"
    description="Document formats only accept PDF at max file size 1mb."
    items={documents}
    uploadLabel={"Upload"}
    isLoading={isLoading}
    onUploadClick={onUploadClick}
    renderItem={(doc) => (
      <GalleryCard<GalleryDocument>
        key={doc.id}
        topContent={
          <FontAwesomeIcon icon={faFilePdf} size="2x" color="#d32f2f" />
        }
        file={doc}
        onAction={onAction}
      />
    )}
  />
);
