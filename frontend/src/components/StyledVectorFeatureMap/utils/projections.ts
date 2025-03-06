import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';

export const MAP_PROJECTION_BC_ALBERS = 'EPSG:3005';
export const MAP_PROJECTION_WEB_MERCATOR = 'EPSG:3857';
export const MAP_PROJECTION_WGS84 = 'EPSG:4326';

// Define BC Albers projection
proj4.defs(
  MAP_PROJECTION_BC_ALBERS,
  '+proj=aea +lat_0=45 +lon_0=-126 +lat_1=50 +lat_2=58.5 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
register(proj4);

export const proj3005 =
  getProjection(MAP_PROJECTION_BC_ALBERS) ?? MAP_PROJECTION_WEB_MERCATOR;
