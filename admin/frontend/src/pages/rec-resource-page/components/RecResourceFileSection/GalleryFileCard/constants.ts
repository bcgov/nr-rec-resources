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
  { key: ACTION_TYPES.VIEW, icon: faEye, label: 'View image' },
  { key: ACTION_TYPES.VIEW_DETAILS, icon: faFile, label: 'View details' },
  { key: ACTION_TYPES.EDIT, icon: faPenToSquare, label: 'Edit details' },
  {
    key: ACTION_TYPES.DOWNLOAD_CONSENT,
    icon: faDownload,
    label: 'Consent form',
  },
  { key: ACTION_TYPES.DELETE, icon: faTrash, label: 'Delete' },
] as const;

/**
 * Preview actions for images (limited subset as the full list doesn't fit in the card)
 */
export const IMAGE_PREVIEW_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'viewDetails' | 'delete'>;
  icon: IconDefinition;
  label: string;
}> = [
  { key: ACTION_TYPES.VIEW, icon: faEye, label: 'View' },
  { key: ACTION_TYPES.VIEW_DETAILS, icon: faFile, label: 'Details' },
  { key: ACTION_TYPES.DELETE, icon: faTrash, label: 'Delete' },
] as const;

/**
 * Available file actions configuration for documents
 */
export const CARD_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'download' | 'delete'>;
  icon: IconDefinition;
  label: string;
}> = [
  { key: ACTION_TYPES.VIEW, icon: faEye, label: 'View' },
  { key: ACTION_TYPES.DOWNLOAD, icon: faDownload, label: 'Download' },
  { key: ACTION_TYPES.DELETE, icon: faTrash, label: 'Delete' },
] as const;
