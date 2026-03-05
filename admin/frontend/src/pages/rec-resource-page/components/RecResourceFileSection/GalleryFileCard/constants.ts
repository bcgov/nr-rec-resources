import { GalleryFileAction } from '@/pages/rec-resource-page/types';
import {
  faDownload,
  faEye,
  faFile,
  faPenToSquare,
  faTrash,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export const ACTION_TYPES = {
  VIEW_DETAILS: 'viewDetails',
  VIEW: 'view',
  DOWNLOAD: 'download',
  DOWNLOAD_CONSENT: 'downloadConsent',
  EDIT: 'edit',
  DELETE: 'delete',
} as const;

const ACTION_VIEW = {
  key: ACTION_TYPES.VIEW,
  icon: faEye,
  label: 'View',
} as const;

const ACTION_VIEW_IMAGE = {
  key: ACTION_TYPES.VIEW,
  icon: faEye,
  label: 'View image',
} as const;

const ACTION_VIEW_DETAILS = {
  key: ACTION_TYPES.VIEW_DETAILS,
  icon: faFile,
  label: 'Details',
} as const;

const ACTION_VIEW_DETAILS_FULL = {
  key: ACTION_TYPES.VIEW_DETAILS,
  icon: faFile,
  label: 'View details',
} as const;

const ACTION_EDIT_DETAILS = {
  key: ACTION_TYPES.EDIT,
  icon: faPenToSquare,
  label: 'Edit details',
} as const;

const ACTION_DOWNLOAD = {
  key: ACTION_TYPES.DOWNLOAD,
  icon: faDownload,
  label: 'Download',
} as const;

const ACTION_CONSENT_FORM = {
  key: ACTION_TYPES.DOWNLOAD_CONSENT,
  icon: faDownload,
  label: 'Consent form',
} as const;

const ACTION_DELETE = {
  key: ACTION_TYPES.DELETE,
  icon: faTrash,
  label: 'Delete',
} as const;

/**
 * Available file actions configuration for images
 */
export const IMAGE_CARD_ACTIONS: ReadonlyArray<{
  key: Extract<
    GalleryFileAction,
    'viewDetails' | 'view' | 'downloadConsent' | 'edit' | 'delete'
  >;
  icon: IconDefinition;
  label: string;
}> = [
  ACTION_VIEW_IMAGE,
  ACTION_VIEW_DETAILS_FULL,
  ACTION_EDIT_DETAILS,
  ACTION_CONSENT_FORM,
  ACTION_DELETE,
] as const;

/**
 * Preview actions for images (limited subset as the full list doesn't fit in the card)
 */
export const IMAGE_PREVIEW_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'viewDetails' | 'delete'>;
  icon: IconDefinition;
  label: string;
}> = [ACTION_VIEW, ACTION_VIEW_DETAILS, ACTION_DELETE] as const;

export const IMAGE_VIEWER_CARD_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'viewDetails'>;
  icon: IconDefinition;
  label: string;
}> = [ACTION_VIEW_IMAGE, ACTION_VIEW_DETAILS_FULL] as const;

export const IMAGE_VIEWER_PREVIEW_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'viewDetails'>;
  icon: IconDefinition;
  label: string;
}> = [ACTION_VIEW, ACTION_VIEW_DETAILS] as const;

/**
 * Available file actions configuration for documents
 */
export const CARD_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'download' | 'delete'>;
  icon: IconDefinition;
  label: string;
}> = [ACTION_VIEW, ACTION_DOWNLOAD, ACTION_DELETE] as const;

export const DOCUMENT_VIEWER_CARD_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'download'>;
  icon: IconDefinition;
  label: string;
}> = [ACTION_VIEW, ACTION_DOWNLOAD] as const;
