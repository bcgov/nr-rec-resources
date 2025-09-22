export enum MAP_LAYER_OPTIONS {
  TILE_SIZE = 512,
  MAX_ZOOM_LEVEL = 30,
  MAX_TEXT_RESOLUTION = 400,
  HIDE_AT_ZOOM_OUT_RESOLUTION = 2500,
}

export const ZOOM_LEVELS = {
  MIN: 0,
  MAX: MAP_LAYER_OPTIONS.MAX_ZOOM_LEVEL,
  PROVINCE: 5.5,
  DISTRICT: 7,
  REGION: 8,
  MUNICIPALITY: 9,
};

export const FIRE_STATUS_COLOUR_MAP: Record<string, string> = {
  'Fire of Note': '#ff6600',
  New: '#fc921f',
  'Out of Control': '#AA1D3E',
  'Being Held': '#FFFF73',
  'Under Control': '#B5E261',
};

// RGBA colours so we can apply opacity
export const FIRE_STATUS_RGBA_COLOUR_MAP: Record<
  string,
  [number, number, number]
> = {
  'Fire of Note': [255, 102, 0],
  New: [252, 146, 31],
  'Out of Control': [170, 29, 62],
  'Being Held': [255, 255, 115],
  'Under Control': [181, 226, 97],
};

export const WILDFIRE_LOCATION_MIN_ZOOM = ZOOM_LEVELS.DISTRICT;

export const RECREATION_FEATURE_LAYER =
  'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/RecSitesReservesInterpForests_DetailsClosures_publicView/FeatureServer/0';

export const WILDFIRE_LOCATION_LAYER =
  'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0';

export const WILDFIRE_PERIMETER_LAYER =
  'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0';

export enum SearchMapFocusModes {
  REC_RESOURCE_ID = 'recResourceId',
}

/**
 * Default map center coordinates in Web Mercator (EPSG:3857) projection
 * Centered north of Williams Lake
 */
export const MAP_CENTER_COORDINATES: [number, number] = [
  -13599121.904043, 7300000,
];

/**
 * Default zoom level for the map
 */
export const DEFAULT_MAP_ZOOM = 6;

export const MAP_LAYER_URLS = {
  BC_BASE_LAYER:
    'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/tile/{z}/{x}/{y}.pbf',
  BC_BASE_STYLE:
    'https://www.arcgis.com/sharing/rest/content/items/b1624fea73bd46c681fab55be53d96ae/resources/styles/root.json',
  CANADA_TOPOGRAPHIC_LAYER:
    'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer/tile/{z}/{y}/{x}.pbf',
  CANADA_TOPOGRAPHIC_STYLE_BASIC:
    'https://www.arcgis.com/sharing/rest/content/items/85e2f70a08494305b60af53bd6fd5cbe/resources/styles/root.json',
  CANADA_TOPOGRAPHIC_STYLE_FULL:
    'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer/resources/styles/root.json',
  CANADA_HILLSHADE_TILE_LAYER:
    'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Hillshade/MapServer/tile/{z}/{y}/{x}',
  WORLD_HILLSHADE_TILE_LAYER:
    'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
  ESRI_WORLD_IMAGERY_LAYER:
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};
