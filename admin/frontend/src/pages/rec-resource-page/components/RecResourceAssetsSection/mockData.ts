import type {
  Asset,
  AssetGeom,
  AssetRepair,
  AssetSummary,
  RecreationRepairCode,
  RecreationStructureCode,
} from './types';

export const MOCK_STRUCTURE_CODES: RecreationStructureCode[] = [
  { structure_code: 1, description: 'Campsite' },
  { structure_code: 2, description: 'Table' },
  { structure_code: 3, description: 'Toilet' },
  { structure_code: 6, description: 'Fire ring' },
  { structure_code: 7, description: 'Sign' },
  { structure_code: 14, description: 'Waste bin' },
];

export const MOCK_REPAIR_CODES: RecreationRepairCode[] = [
  { repair_code: 'MI', description: 'Minor repair' },
  { repair_code: 'MA', description: 'Major repair' },
  { repair_code: 'BR', description: 'Beam replacement' },
];

const audit = {
  created_by: 'jmcleod',
  created_at: '2018-06-02T09:14:00Z',
  updated_by: 'jmcleod',
  updated_at: '2024-07-04T09:14:00Z',
};

// [asset_id, code, name, parent_id, length, width, area, default_value, actual_value]
type MockRow = [
  number,
  number,
  string,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];

const rows: MockRow[] = [
  [1, 1, 'Campsite 1', null, 18, 10, 180, 4500, 4800],
  [2, 2, 'C01 Picnic Table', 1, 2.4, 1.5, null, 900, 950],
  [3, 6, 'C01 Fire Ring', 1, 1.0, 1.0, null, 350, 350],
  [4, 3, 'C01 Toilet', 1, 1.5, 1.5, 2.25, 12000, 12500],
  [5, 2, 'Day-use Table A', null, 2.4, 1.5, null, 900, 900],
  [6, 3, 'Toilet — North Loop', null, 1.5, 1.5, 2.25, 12000, 11200],
  [7, 7, 'Site Information Sign', null, null, 1.2, 2.4, 1500, 1550],
  [8, 14, 'Waste Bin — Day-use', null, 0.6, 0.6, null, 900, 940],
];

function buildAssets(recResourceId: string): Asset[] {
  return rows.map(
    ([
      asset_id,
      recreation_structure_code,
      asset_name,
      parent_id,
      asset_length,
      asset_width,
      asset_area,
      default_value,
      actual_value,
    ]) => ({
      asset_id,
      parent_id,
      rec_resource_id: recResourceId,
      recreation_structure_code,
      asset_name,
      asset_tag: null,
      asset_comment: null,
      legacy_structure_id: null,
      asset_length,
      asset_width,
      asset_area,
      default_value,
      actual_value,
      installation_date: null,
      ...audit,
    }),
  );
}

const repairs: AssetRepair[] = [
  {
    repair_id: 5000,
    asset_id: 1,
    recreation_remed_repair_code: 'MI',
    estimated_repair_cost: 300,
    actual_repair_cost: null,
    repair_completed_date: null, // outstanding
    ...audit,
  },
  {
    repair_id: 5004,
    asset_id: 1,
    recreation_remed_repair_code: 'BR',
    estimated_repair_cost: 6200,
    actual_repair_cost: 5950,
    repair_completed_date: '2024-03-14',
    ...audit,
  },
  {
    repair_id: 5001,
    asset_id: 4,
    recreation_remed_repair_code: 'MI',
    estimated_repair_cost: 520,
    actual_repair_cost: null,
    repair_completed_date: null, // outstanding
    ...audit,
  },
  {
    repair_id: 5002,
    asset_id: 6,
    recreation_remed_repair_code: 'MA',
    estimated_repair_cost: 7400,
    actual_repair_cost: null,
    repair_completed_date: null, // outstanding
    ...audit,
  },
  {
    repair_id: 5003,
    asset_id: 2,
    recreation_remed_repair_code: 'BR',
    estimated_repair_cost: 450,
    actual_repair_cost: 420,
    repair_completed_date: '2024-06-25',
    ...audit,
  },
];

const geoms: AssetGeom[] = [
  {
    asset_id: 1,
    geometry_type_code: 'PT',
    latitude: 49.94212,
    longitude: -123.03604,
  },
  {
    asset_id: 2,
    geometry_type_code: 'PT',
    latitude: 49.94188,
    longitude: -123.03521,
  },
  {
    asset_id: 4,
    geometry_type_code: 'PT',
    latitude: 49.94255,
    longitude: -123.03448,
  },
  {
    asset_id: 6,
    geometry_type_code: 'PT',
    latitude: 49.9394,
    longitude: -123.03071,
  },
  {
    asset_id: 7,
    geometry_type_code: 'PT',
    latitude: 49.94148,
    longitude: -123.03399,
  },
];

export function getMockAssets(recResourceId: string): Asset[] {
  return buildAssets(recResourceId);
}

export function getMockAssetRepairs(): AssetRepair[] {
  return repairs;
}

export function getMockAssetGeoms(): AssetGeom[] {
  return geoms;
}

export function getMockAssetSummary(_recResourceId: string): AssetSummary {
  return {
    total_assets: rows.length,
    total_campsites: rows.filter(([, code]) => code === 1).length,
    // total_campsites: rows.filter(([, code]) => code === 1).length,
    total_value: rows.reduce((sum, r) => sum + (r[8] ?? r[7] ?? 0), 0),
    outstanding_repairs: repairs.filter((r) => !r.repair_completed_date).length,
    spent_to_date: repairs.reduce(
      (sum, r) => sum + (r.actual_repair_cost ?? 0),
      0,
    ),
    last_inspection_date: '2024-09-11',
    last_hzd_tree_assessment_date: '2024-05-02',
  };
}
