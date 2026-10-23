import { ExhibitAPageSize } from './dto/generate-exhibit-a.dto';
import { EsriGeometryType } from './exhibit-a.types';

export const DEFAULT_FTA_MAP_SERVICE =
  process.env.CFG_FTA_MAP_SERVICE?.trim() ??
  'https://test.maps.gov.bc.ca/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute';

export const DEFAULT_FTA_ARCGIS_SERVER_TEMPLATE =
  process.env.CFG_FTA_ARC_GIS_SERVERS?.trim() ??
  'https://test.maps.gov.bc.ca/arcgis/rest/services/fta/%d/MapServer';

export const KNOWN_FTA_SERVICE_SCALES = [
  5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000,
] as const;

export const SCALE_BY_SPAN: ReadonlyArray<[number, number]> = [
  [0.02, 5000],
  [0.05, 10000],
  [0.08, 15000],
  [0.12, 20000],
  [0.18, 30000],
  [0.4, 50000],
];

export const PAGE_SIZE_RULES: ReadonlyArray<
  [number, number, ExhibitAPageSize]
> = [
  [10000, 0.004, ExhibitAPageSize.A],
  [20000, 0.01, ExhibitAPageSize.B],
  [30000, 0.02, ExhibitAPageSize.C],
  [50000, 0.05, ExhibitAPageSize.D],
];

export const WGS84 = { wkid: 4326 };
export const HTTP_URL = /^https?:\/\//i;
export const LOG_PREVIEW_CHARS = 3000;
export const FETCH_TIMEOUT_MS = 30_000;
export const EXPORT_TIMEOUT_MS = 120_000;
export const LAYER_CACHE_TTL_MS = 60 * 60 * 1000;
export const MAX_EXPORT_PX = 4096;
export const MIN_DPI = 72;
export const MAX_DPI = 200;

export const BLACK = [0, 0, 0, 255];
export const WHITE = [255, 255, 255, 255];

export const SYMBOLS: Record<EsriGeometryType, Record<string, unknown>> = {
  esriGeometryPolygon: {
    type: 'esriSFS',
    style: 'esriSFSHollow',
    color: [0, 0, 0, 0],
    outline: { type: 'esriSLS', style: 'esriSLSSolid', color: BLACK, width: 3 },
  },
  esriGeometryPolyline: {
    type: 'esriSLS',
    style: 'esriSLSSolid',
    color: BLACK,
    width: 3,
  },
  esriGeometryPoint: {
    type: 'esriSMS',
    style: 'esriSMSDiamond',
    size: 8,
    color: BLACK,
    outline: { type: 'esriSLS', style: 'esriSLSSolid', color: WHITE, width: 1 },
  },
};

export const SUBMISSION_FIELDS = [
  { name: 'OBJECTID', type: 'esriFieldTypeOID', alias: 'OBJECTID' },
  {
    name: 'section_id',
    type: 'esriFieldTypeString',
    alias: 'section_id',
    length: 128,
  },
];

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const toEnum = <T extends string>(
  enumObj: Record<string, T>,
  value: string | null,
): T | undefined =>
  value && (Object.values(enumObj) as string[]).includes(value)
    ? (value as T)
    : undefined;
