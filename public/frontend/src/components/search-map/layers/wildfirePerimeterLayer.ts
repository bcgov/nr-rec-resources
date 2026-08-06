import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Stroke, Fill } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import {
  FIRE_STATUS_RGBA_COLOUR_MAP,
  WILDFIRE_PERIMETER_LAYER,
} from '@/components/search-map/constants';

const WILDFIRE_PERIMETER_FIELDS = [
  'FIRE_NUMBER',
  'FIRE_YEAR',
  'FIRE_STATUS',
  'FIRE_SIZE_HECTARES',
  'TRACK_DATE',
  'LOAD_DATE',
  'FIRE_URL',
  'OBJECTID',
  'GlobalID',
];

export const createWildfirePerimeterStyle = (
  feature: FeatureLike,
  isHovered = false,
) => {
  const status = feature.get('FIRE_STATUS') || 'default';
  const [r, g, b] = FIRE_STATUS_RGBA_COLOUR_MAP[status] || [153, 153, 153];
  const strokeOpacity = isHovered ? 0.9 : 0.7;
  const fillOpacity = isHovered ? 0.2 : 0.1;

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
        `&where=${encodeURIComponent("FIRE_STATUS <> 'Out' OR FIRE_STATUS IS NULL")}` +
        `&outFields=${WILDFIRE_PERIMETER_FIELDS.join(',')}` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&inSR=102100` +
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
