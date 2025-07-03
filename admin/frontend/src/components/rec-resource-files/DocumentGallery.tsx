import React from "react";
import { GalleryAccordion } from "./GalleryAccordion";
import { GalleryCard } from "./GalleryCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";
import { PendingRecreationResourceDocDto } from "./types";

export interface DocumentGalleryProps {
  documents: PendingRecreationResourceDocDto[];
  onAction: (
    action: "view" | "download" | "delete" | "add",
    file: PendingRecreationResourceDocDto,
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
    renderItem={(doc, idx) => (
      <GalleryCard<PendingRecreationResourceDocDto>
        key={(doc as any).ref_id || idx}
        topContent={
          <FontAwesomeIcon icon={faFilePdf} size="2x" color="#d32f2f" />
        }
        filename={doc.title}
        date={
          doc.created_at
            ? new Date(doc.created_at).toLocaleString("en-CA", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : ""
        }
        file={doc}
        onAction={onAction}
      />
    )}
  />
);
