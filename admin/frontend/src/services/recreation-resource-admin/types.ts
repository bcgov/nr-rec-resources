import {
  RecreationResourceDetailDto,
  RecreationFeeDto,
} from '@/services/recreation-resource-admin/models';

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

/**
 * Extended fee model with additional UI-specific properties including readable dates.
 */
export interface RecreationFeeUIModel extends RecreationFeeDto {
  fee_start_date_readable_utc: string | null;
  fee_end_date_readable_utc: string | null;
}

export interface RecreationResourceOptionUIModel {
  id: string | null;
  label: string;
  children?: RecreationResourceOptionUIModel[];
  is_archived?: boolean;
  disabled?: boolean;
}
