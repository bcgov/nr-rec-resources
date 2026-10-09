export const ACTION_CODES = ['I', 'U'] as const;
export const ACCURACY_CODES = ['1', '5', '10', '100', '1000'] as const;
export const CAPTURE_METHODS = ['GPS', 'DIGITIZE', 'Ortho', 'Mono'] as const;
export const DATA_SOURCES = [
  'AirPhoto',
  'TRIM',
  'Satellite',
  'Survey',
  'Unknown',
] as const;

export const BC_EXTENT_3005 = {
  minX: 100000,
  maxX: 1900000,
  minY: 300000,
  maxY: 1750000,
};

export const SHAPEFILE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_FEATURE_COUNT = 5000;
export const MAX_TOTAL_VERTEX_COUNT = 200000;
export const MAX_VERTEX_COUNT_PER_FEATURE = 50000;
export const MAX_POLYGON_PART_SEPARATION_METRES = 500;
export const ZERO_METRIC_EPSILON = 0.0001;
export const SHAPEFILE_ALLOWED_EXTENSIONS = ['shp', 'dbf', 'zip'] as const;
export const DEFAULT_SECTION_ID_FIELD_NAME = 'section_id';
export const REQUIRED_SHP_FILE_MESSAGE = 'A .shp file is required.';
export const SHAPEFILE_BASENAME_MISMATCH_MESSAGE =
  'The .dbf filename must match the uploaded .shp filename.';
export const SECTION_ID_FIELD_CANDIDATES = [
  'sectionid',
  'section_id',
  'section',
  'segmentid',
  'segment_id',
  'segment',
] as const;
export const MAP_LABEL_FIELD_CANDIDATES = ['maplabel', 'map_label'] as const;
