import { GalleryFileAction } from '@/pages/rec-resource-page/types';
import {
  faCloudDownload,
  faEye,
  faTrash,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export const ACTION_TYPES = {
  DOWNLOAD: 'download',
  DELETE: 'delete',
  VIEW: 'view',
} as const;

/**
 * Available file actions configuration
 */
export const CARD_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryFileAction, 'view' | 'download' | 'delete'>;
  icon: IconDefinition;
  label: string;
}> = [
  { key: ACTION_TYPES.VIEW, icon: faEye, label: 'View' },
  { key: ACTION_TYPES.DOWNLOAD, icon: faCloudDownload, label: 'Download' },
  { key: ACTION_TYPES.DELETE, icon: faTrash, label: 'Delete' },
] as const;
