// Generic file type for gallery
export interface GalleryFile {
  id: string;
  name: string;
  date: string;
  url: string;
  extension: string;
  isUploading?: boolean;
  uploadFailed?: boolean;
  pendingFile?: File; // for pending uploads and retry
  isDownloading?: boolean;
  isDeleting?: boolean;
  deleteFailed?: boolean;
}

// Specialized type for documents
export interface GalleryDocument extends GalleryFile {
  doc_code?: string;
  doc_code_description?: string;
}

export type GalleryFileAction =
  | "view"
  | "download"
  | "retry"
  | "delete"
  | "dismiss";

export type GalleryGeneralAction =
  | "upload"
  | "confirm-upload"
  | "confirm-delete"
  | "cancel-delete"
  | "cancel-upload";
