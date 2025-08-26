import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Stroke } from 'ol/style';
import { FeatureLike } from 'ol/Feature';

export const RECREATION_LINES_LAYER =
  'https://maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_forest_tenure/MapServer/3';

// Fields we want to fetch
const RECREATION_LINE_FIELDS = [
  'OBJECTID',
  'TENURE_TYPE',
  'TENURE_NAME',
  'LIFE_CYCLE_STATUS_CODE',
];

// Line style for active recreation lines
export const createRecreationLineStyle = (
  feature: FeatureLike,
  isHovered = false,
) => {
  const color = 'rgba(255, 0, 255, 1)'; // magenta

  return new Style({
    stroke: new Stroke({
      color: isHovered ? 'rgba(255, 0, 255, 1)' : color,
      //  width: isHovered ? 4 : 2,
      width: 6,

      lineDash: [10, 5], // dashed for debug
    }),
  });
};

// Vector source fetching only active lines
export const createRecreationLinesSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');
      return (
        `${RECREATION_LINES_LAYER}/query/?` +
        `f=json` +
        `&outFields=${RECREATION_LINE_FIELDS.join(',')}` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: bboxStrategy,
    wrapX: false,
  });

// The actual vector layer
export const createRecreationLinesLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: (feature) => createRecreationLineStyle(feature),
  });
