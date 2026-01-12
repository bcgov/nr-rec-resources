import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecreationResourceImageVariantDto } from '@/services/recreation-resource-admin';
import { RouteHandle } from '@shared/index';

export type FileType = 'image' | 'document';

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
  type: FileType;
  processingProgress?: number; // 0-100 for image processing
  processingStage?: string; // e.g., "Processing image...", "Uploading..."
}

// Specialized type for documents
export interface GalleryDocument extends GalleryFile {
  doc_code?: string;
  doc_code_description?: string;
  type: 'document';
}

export interface GalleryImage extends GalleryFile {
  variants: Array<RecreationResourceImageVariantDto>;
  previewUrl: string;
  type: 'image';
}

export type GalleryFileAction =
  | 'view'
  | 'download'
  | 'retry'
  | 'delete'
  | 'dismiss';

export type GalleryGeneralAction =
  | 'upload'
  | 'confirm-upload'
  | 'confirm-delete'
  | 'cancel-delete'
  | 'cancel-upload';

export interface RecResourcePageRouteHandle<TContext>
  extends RouteHandle<TContext> {
  tab: RecResourceNavKey;
}

export interface RecResourceRouteContext {
  resourceId: string;
  resourceName?: string;
}
