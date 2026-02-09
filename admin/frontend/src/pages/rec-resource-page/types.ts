import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecreationResourceImageVariantDto } from '@/services/recreation-resource-admin';
import { RouteHandle } from '@shared/index';
import { ImageUploadConsentData } from './store/recResourceFileTransferStore';

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
  consentData?: ImageUploadConsentData;
  file_size?: number;
  date_taken?: string;
  photographer_type?: string;
  photographer_type_description?: string;
  photographer_name?: string;
  contains_pii?: boolean;
  photographer_display_name?: string;
}

export type GalleryFileAction =
  | 'view'
  | 'viewDetails'
  | 'download'
  | 'downloadConsent'
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
