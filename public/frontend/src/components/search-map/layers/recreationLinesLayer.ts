import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style, Stroke } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import {
  RECREATION_LINES_LAYER,
  ZOOM_LEVELS,
} from '@/components/search-map/constants';

const RECREATION_LINE_FIELDS = [
  'FOREST_FILE_ID',
  'LIFE_CYCLE_STATUS_CODE',
  'OBJECTID',
];

export const createRecreationLineStyle = (
  _feature: FeatureLike,
  isHovered = false,
) => {
  const color = '#7BC371';

  return new Style({
    stroke: new Stroke({
      color: isHovered ? 'rgba(255, 0, 255, 1)' : color,
      width: 2,
      lineDash: [10, 5],
    }),
  });
};

export const createRecreationLinesSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    overlaps: false,
  });

export const recreationLinesSource = createRecreationLinesSource();

export const loadFeaturesForFilteredIds = async (
  filteredIds: string[],
  source: VectorSource,
  projection: any,
) => {
  source.clear();

  const filteredSet = new Set(filteredIds);
  const format = new EsriJSON();

  const url =
    `${RECREATION_LINES_LAYER}/query/?` +
    `f=json` +
    `&where=1=1` +
    `&outFields=${RECREATION_LINE_FIELDS.join(',')}` +
    `&inSR=102100` +
    `&outSR=102100`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const features = format.readFeatures(data, {
      featureProjection: projection,
    });

    const filteredFeatures = features.filter((feature) => {
      const id = feature.get('FOREST_FILE_ID');
      feature.setId(String(id));
      feature.set('type', 'recreation-line');
      return filteredSet.has(String(id));
    });

    source.addFeatures(filteredFeatures);
  } catch (error) {
    console.error('Error fetching features:', error);
  }
};

export const createRecreationLinesLayer = () =>
  new VectorLayer({
    source: recreationLinesSource,
    style: (feature) => createRecreationLineStyle(feature),
    minZoom: ZOOM_LEVELS.REGION,
  });
