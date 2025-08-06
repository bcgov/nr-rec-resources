import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Fill, Stroke } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import {
  FIRE_STATUS_RGBA_COLOUR_MAP,
  WILDFIRE_PERIMETER_LAYER,
} from '@/components/search-map/constants';

const WILDFIRE_PERIMETER_FIELDS = [
  'FIRE_NUMBER',
  'FIRE_STATUS',
  'OBJECTID',
  'GlobalID',
];

export const createWildfirePerimeterStyle = (
  feature: FeatureLike,
  isHovered = false,
) => {
  const status = feature.get('FIRE_STATUS') || 'default';
  const [r, g, b] = FIRE_STATUS_RGBA_COLOUR_MAP[status] || [153, 153, 153];
  const fillOpacity = isHovered ? 0.2 : 0.3;
  const strokeOpacity = isHovered ? 0.4 : 0.6;

  return new Style({
    stroke: new Stroke({
      color: `rgba(${r}, ${g}, ${b}, ${strokeOpacity})`,
      width: isHovered ? 2.5 : 1.5,
    }),
    fill: new Fill({
      color: `rgba(${r}, ${g}, ${b}, ${fillOpacity})`,
    }),
  });
};

export const createWildfirePerimeterSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');
      return (
        `${WILDFIRE_PERIMETER_LAYER}/query/?` +
        `f=json` +
        `&where=${encodeURIComponent("FIRE_STATUS <> 'Out'")}` +
        `&outFields=${WILDFIRE_PERIMETER_FIELDS.join(',')}` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: bboxStrategy,
    wrapX: false,
  });

export const createWildfirePerimeterLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: (feature) => createWildfirePerimeterStyle(feature),
  });
