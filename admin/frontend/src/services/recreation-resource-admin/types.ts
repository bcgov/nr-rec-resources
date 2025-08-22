import { RecreationResourceDetailDto } from "./sdk";

/**
 * Extended detail for a recreation resource.
 */
export interface RecreationResourceDetail extends RecreationResourceDetailDto {
  maintenance_standard_description: string;
  recreation_district_description?: string;
  recreation_status_description?: string;
}
