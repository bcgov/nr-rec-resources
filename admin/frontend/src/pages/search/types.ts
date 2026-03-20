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
  establishment_date_from?: string;
  establishment_date_to?: string;
  access: string[];
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
}
