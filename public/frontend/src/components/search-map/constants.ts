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
