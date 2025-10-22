import {
  faCloudDownload,
  faEye,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ACTION_TYPES } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/constants';

export const ESTABLISHMENT_ORDER_ACTIONS = [
  { key: ACTION_TYPES.VIEW, icon: faEye, label: 'View' },
  { key: ACTION_TYPES.DOWNLOAD, icon: faCloudDownload, label: 'Download' },
  { key: ACTION_TYPES.DELETE, icon: faTrash, label: 'Delete' },
] as const;
