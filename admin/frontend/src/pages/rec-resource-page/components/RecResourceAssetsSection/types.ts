/** rst.recreation_asset */
export interface Asset {
  asset_id: number;
  parent_id: number | null;
  rec_resource_id: string;
  recreation_structure_code: number;
  asset_name: string | null;
  asset_tag: string | null;
  asset_comment: string | null;
  legacy_structure_id: string | null;
  asset_length: number | null;
  asset_width: number | null;
  asset_area: number | null;
  default_value: number | null;
  actual_value: number | null;
  installation_date: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

/** rst.recreation_asset_repair */
export interface AssetRepair {
  repair_id: number;
  asset_id: number;
  recreation_remed_repair_code: string | null;
  estimated_repair_cost: number | null;
  actual_repair_cost: number | null;
  repair_completed_date: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

export type GeometryTypeCode = 'PT' | 'LN' | 'PY';

/**
 * rst.recreation_asset_geom — 1:1 side record. The DB stores a PostGIS geometry
 * (SRID 3005); on the frontend we work with a WGS84 point (lat/long) for point assets.
 */
export interface AssetGeom {
  asset_id: number;
  geometry_type_code: GeometryTypeCode | null;
  latitude: number | null;
  longitude: number | null;
}

/** rst.recreation_structure_code lookup */
export interface RecreationStructureCode {
  structure_code: number;
  description: string;
}

/** rst.recreation_remed_repair_code lookup */
export interface RecreationRepairCode {
  repair_code: string;
  description: string;
}

export interface AssetSummary {
  total_assets: number;
  total_campsites: number;
  total_value: number;
  outstanding_repairs: number;
  spent_to_date: number;
  last_inspection_date: string | null;
  last_hzd_tree_assessment_date: string | null;
}
