/** rst.recreation_asset_repair */
export interface AssetRepair {
  repair_id: number;
  asset_id: number;
  recreation_remed_repair_code: string | null;
  estimated_repair_cost: number | null;
  actual_repair_cost: number | null;
  repair_completed_date: string | null;
  urgency: string | null;
  trail_segment_start: string | null;
  trail_segment_end: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

/**
 * rst.recreation_asset, plus the derived WGS84 lat/long (from recreation_asset_geom) and
 * nested repairs (only populated when fetched with include_repair=true).
 */
export interface Asset {
  asset_id: number;
  parent_id: number | null;
  rec_resource_id: string;
  asset_code: number;
  asset_name: string | null;
  asset_tag: string | null;
  asset_comment: string | null;
  legacy_structure_id: string | null;
  asset_length: number | null;
  asset_width: number | null;
  asset_area: number | null;
  actual_value: number | null;
  installation_date: string | null;
  updated_by: string | null;
  updated_at: string | null;
  geometry_type_code: string | null;
  latitude: number | null;
  longitude: number | null;
  recreation_asset_repair: AssetRepair[] | null;
}

/** rst.recreation_asset_code lookup */
export interface AssetCode {
  asset_code: number;
  description?: string;
  has_length?: boolean;
  has_width?: boolean;
  has_area?: boolean;
  default_value?: number | null;
}

/** rst.recreation_remed_repair_code lookup */
export interface RepairCode {
  recreation_remed_repair_code: string;
  description?: string;
}

export interface AssetSummary {
  total_assets: number;
  total_campsites: number;
  total_value: number;
  outstanding_repairs: number;
  spent_to_date: number;
  last_inspection_date: Date | null;
  last_hzd_tree_assessment_date: Date | null;
}
