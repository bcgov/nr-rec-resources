import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import {
  FIRE_STATUS_RGBA_COLOUR_MAP,
  WILDFIRE_LOCATION_LAYER,
  WILDFIRE_LOCATION_MIN_ZOOM,
} from '@/components/search-map/constants';

const WILDFIRE_FIELDS = [
  'IGNITION_DATE',
  'FIRE_STATUS',
  'CURRENT_SIZE',
  'OBJECTID',
  'FIRE_NUMBER',
  'GEOGRAPHIC_DESCRIPTION',
  'FIRE_URL',
];

export const createWildfireLocationStyle = (
  feature: FeatureLike,
  isHovered = false,
) => {
  const status = feature.get('FIRE_STATUS') || 'default';
  const [r, g, b] = FIRE_STATUS_RGBA_COLOUR_MAP[status] || [153, 153, 153];
  const opacity = isHovered ? 0.5 : 1;

  return new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({ color: `rgba(${r},${g},${b},${opacity})` }),
      stroke: new Stroke({
        color: '#000',
        width: 1,
      }),
    }),
  });
};

export const createWildfireLocationSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');

      return (
        `${WILDFIRE_LOCATION_LAYER}/query/?` +
        `f=json` +
        `&where=${encodeURIComponent("FIRE_STATUS <> 'Out'")}` +
        `&outFields=${WILDFIRE_FIELDS.join(',')}` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: bboxStrategy,
    wrapX: false,
  });

export const createWildfireLocationLayer = (source: VectorSource) => {
  const layer = new VectorLayer({
    source,
    style: (feature) => createWildfireLocationStyle(feature),
    minZoom: WILDFIRE_LOCATION_MIN_ZOOM,
  });

  return layer;
};
