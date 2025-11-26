import { RecreationResourceDetailDto } from '@/services/recreation-resource-admin/models';

/**
 * Extended detail for a recreation resource with additional UI-specific properties.
 */
export interface RecreationResourceDetailUIModel
  extends RecreationResourceDetailDto {
  maintenance_standard_code?: string;
  maintenance_standard_description?: string;
  recreation_district_description?: string;
  recreation_status_code?: number;
  recreation_status_description?: string;
  project_established_date_readable_utc: string | null;
  control_access_code?: string;
  control_access_code_description?: string;
  risk_rating_code?: string;
  risk_rating_description?: string;
}

export interface RecreationResourceOptionUIModel {
  id: string | null;
  label: string;
  children?: RecreationResourceOptionUIModel[];
}
