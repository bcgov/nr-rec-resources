import type { AdminSearchSort } from '@/pages/search/searchDefinitions';

export type {
  AdminSearchColumnId,
  AdminSearchSort,
} from '@/pages/search/searchDefinitions';

export interface AdminSearchFilters {
  type: string[];
  district: string[];
  activities: string[];
  status: string[];
  closestCommunity: string[];
  establishment_date_from?: string;
  establishment_date_to?: string;
  access: string[];
  established?: string;
  publicAccessStatus: string[];
  recStatus: string[];
}

export interface AdminSearchRouteState extends AdminSearchFilters {
  q: string;
  sort: AdminSearchSort;
  page: number;
  page_size: number;
}

export interface AdminAppliedFilterChip {
  key: string;
  label: string;
  onClear: () => void;
  /** When true the chip represents a default/implicit filter and is displayed without a clear button */
  isDefault?: boolean;
}

export interface AdminSearchResultRow {
  recResourceId: string;
  projectName: string;
  recreationResourceType: string;
  district: string;
  establishmentDate: string;
  accessType: string;
  feeType: string;
  definedCampsites: string;
  closestCommunity: string;
  status: string;
  statusCode: number;
  recStatusCode?: string | null;
  recStatusDescription?: string | null;
  visible: boolean;
  publicAccessStatus: string | null;
}
