import { RecreationResourceDetailDto } from '@/services/recreation-resource-admin/models';

/**
 * Extended detail for a recreation resource.
 */
export interface RecreationResourceDetailUIModel
  extends RecreationResourceDetailDto {
  maintenance_standard_description: string;
  recreation_district_description?: string;
  recreation_status_description?: string;
  project_established_date_readable_utc: string | null;
  risk_rating_description?: string;
}
