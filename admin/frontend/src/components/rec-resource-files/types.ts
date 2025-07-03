import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";

// Generic file type for gallery
export interface GalleryFile {
  id: string;
  name: string;
  date: string;
  url: string;
  extension: string;
  isUploading?: boolean;
  uploadFailed?: boolean;
}

// Specialized type for images
export interface GalleryImage extends GalleryFile {
  rec_resource_id: string;
}

// Specialized type for documents
export interface GalleryDocument extends GalleryFile {
  doc_code?: string;
  doc_code_description?: string;
  rec_resource_id: string;
}

export type GalleryAction = "view" | "download" | "delete" | "add";
