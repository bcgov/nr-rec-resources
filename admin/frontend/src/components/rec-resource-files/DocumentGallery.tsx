import React from "react";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryCard } from "./GalleryCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";

export interface DocumentGalleryProps {
  documents: RecreationResourceDocDto[];
  onAction: (
    action: "view" | "download" | "delete",
    file: RecreationResourceDocDto,
  ) => void;
  isLoading?: boolean;
}

export const DocumentGallery: React.FC<DocumentGalleryProps> = ({
  documents,
  onAction,
  isLoading = false,
}) => (
  <GalleryAccordion
    eventKey="documents"
    title="Public documents"
    description="Document formats only accept PDF at max file size 1mb."
    items={documents}
    uploadLabel={"Upload"}
    isLoading={isLoading}
    renderItem={(doc, idx) => (
      <GalleryCard<RecreationResourceDocDto>
        key={idx}
        topContent={
          <FontAwesomeIcon icon={faFilePdf} size="2x" color="#d32f2f" />
        }
        filename={doc.title}
        // todo: fix the date
        date={new Date(doc.created_at).toLocaleString("en-CA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
        file={doc}
        onAction={onAction}
      />
    )}
  />
);
