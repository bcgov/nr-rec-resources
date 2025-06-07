import { Fill, Stroke } from 'ol/style';

export const FILL_COLOR = '#42814A66';
export const TEXT_STROKE_COLOR = '#000';

export const TEXT_STYLE = {
  backgroundFill: new Fill({ color: '#000' }),
  fill: new Fill({ color: '#FFF' }),
  stroke: new Stroke({
    color: TEXT_STROKE_COLOR,
  }),
};

export const MAP_STYLES = {
  STROKE: {
    POLYGON_COLOR: '#42814A',
    TRAIL_COLOR: '#FF00FF',
    WIDTH: 3,
    LINE_DASH: [6, 6],
  },
  FILL: {
    COLOR: FILL_COLOR,
  },
};

export const MATOMO_TRACKING_CATEGORY_MAP = 'Map';
// Coordinate Reference System (CRS) projections
export const MAP_PROJECTION_BC_ALBERS = 'EPSG:3005';
export const MAP_PROJECTION_WEB_MERCATOR = 'EPSG:3857';
export const MAP_PROJECTION_WGS84 = 'EPSG:4326';

/**
 * Default map center coordinates in Web Mercator (EPSG:3857) projection
 * Centered on Williams Lake, British Columbia
 */
export const MAP_CENTER_COORDINATES = [-13599121.904043, 6826743.870206];

/**
 * Map extent coordinates defining the viewable boundary of British Columbia
 * Includes padding around the province border
 * Format: [West, South, East, North] in Web Mercator projection
 */
export const MAP_EXTENT_COORDINATES = [
  -17280139.91792959, 4325438.545421897, -11463395.850036409,
  10040592.902794234,
];

/**
 * URLs for map services
 * @property baseLayer - Vector tile service URL for BC base map
 * @property styles - URL for map styling configuration
 */
export const MAP_URLS = {
  baseLayer:
    'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/tile/{z}/{x}/{y}.pbf',
  styles:
    'https://www.arcgis.com/sharing/rest/content/items/b1624fea73bd46c681fab55be53d96ae/resources/styles/root.json',
};

/**
 * Default zoom level for the map
 */
export const DEFAULT_MAP_ZOOM = 8;

export const MAP_ICONS = {
  RECREATION_SITE: `${import.meta.env.VITE_RECREATION_RESOURCE_ASSETS_BASE_URL}//filestore//8//9//4//3//3_5d2228bc2b3e1e8//33498_195d0e9aba87dc6.png?v=1750306156`,
  INTERPRETIVE_FOREST: `${import.meta.env.VITE_RECREATION_RESOURCE_ASSETS_BASE_URL}//filestore//9//9//4//3//3_ee0d9750da75ce8//33499_0cbf3c3cf9fff51.png?v=1750309698`,
  RECREATION_TRAIL_HEAD: `${import.meta.env.VITE_RECREATION_RESOURCE_ASSETS_BASE_URL}//filestore//7//9//4//3//3_56b000b2bec88d5//33497_321265ef48c7f82.png?v=1750305537`,
  LOCATION_DOT_BLUE: `${import.meta.env.VITE_RECREATION_RESOURCE_ASSETS_BASE_URL}//filestore//1//0//5//3//3_66d79d1d23e2b87//33501_ee55d0165f33a02.png?v=1750312971`,
};
