import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Fill, Stroke } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { FIRE_EVACUATION_LAYER } from '@/components/search-map/constants';

const FIRE_EVACUATION_FIELDS = [
  'ORDER_ALERT_STATUS',
  'ORDER_ALERT_NAME',
  'EVENT_NAME',
  'EVENT_TYPE',
  'ISSUING_AGENCY',
  'DATE_MODIFIED',
  'OBJECTID',
];

// Colours match the official BC Wildfire Service legend
const STATUS_COLOURS: Record<string, { fill: string; stroke: string }> = {
  Order: { fill: 'rgba(232, 83, 74, 0.5)', stroke: 'rgba(180, 30, 20, 0.9)' },
  'Tactical Evacuation': {
    fill: 'rgba(196, 135, 74, 0.5)',
    stroke: 'rgba(140, 80, 20, 0.9)',
  },
  Alert: { fill: 'rgba(240, 165, 0, 0.5)', stroke: 'rgba(180, 110, 0, 0.9)' },
  'All Clear': {
    fill: 'rgba(123, 193, 66, 0.5)',
    stroke: 'rgba(70, 140, 20, 0.9)',
  },
};

const DEFAULT_COLOUR = {
  fill: 'rgba(232, 83, 74, 0.5)',
  stroke: 'rgba(180, 30, 20, 0.9)',
};

export const createFireEvacuationStyle = (
  feature: FeatureLike,
  isHovered = false,
) => {
  const status = feature.get('ORDER_ALERT_STATUS') || 'Order';
  const colours = STATUS_COLOURS[status] ?? DEFAULT_COLOUR;

  return new Style({
    stroke: new Stroke({
      color: colours.stroke,
      width: isHovered ? 3 : 2,
    }),
    fill: new Fill({
      color: isHovered
        ? colours.fill.replace(', 0.5)', ', 0.7)')
        : colours.fill,
    }),
  });
};

export const createFireEvacuationSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');
      return (
        `${FIRE_EVACUATION_LAYER}/query/?` +
        `f=json` +
        `&where=1%3D1` +
        `&outFields=${FIRE_EVACUATION_FIELDS.join(',')}` +
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

export const createFireEvacuationLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: (feature) => createFireEvacuationStyle(feature),
  });
