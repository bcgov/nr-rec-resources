import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style, Stroke, Fill } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import {
  RECREATION_SITE_BOUNDARY_LAYER,
  ZOOM_LEVELS,
} from '@/components/search-map/constants';

const RECREATION_SITE_BOUNDARY_FIELDS = ['OBJECTID', 'FOREST_FILE_ID'];

export const createRecreationSiteBoundaryStyle = (
  _feature: FeatureLike,
  isHovered = false,
) => {
  const strokeColor = isHovered ? 'rgba(255,0,255,1)' : 'rgba(45,128,32,0.6)';

  return new Style({
    stroke: new Stroke({
      color: strokeColor,
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(45,128,32,0.1)',
    }),
  });
};

export const createRecreationSiteBoundarySource = () =>
  new VectorSource({
    format: new EsriJSON(),
    overlaps: false,
  });

export const recreationSiteBoundarySource =
  createRecreationSiteBoundarySource();

export const loadFeaturesForFilteredIds = async (
  filteredIds: string[],
  source: VectorSource,
  projection: any,
) => {
  source.clear();

  const filteredSet = new Set(filteredIds);
  const format = new EsriJSON();

  const url =
    `${RECREATION_SITE_BOUNDARY_LAYER}/query/?` +
    `f=json` +
    `&where=1=1` +
    `&outFields=${RECREATION_SITE_BOUNDARY_FIELDS.join(',')}` +
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
      feature.set('type', 'recreation-site-boundary');
      return filteredSet.has(String(id));
    });

    source.addFeatures(filteredFeatures);
  } catch (error) {
    console.error('Error fetching features:', error);
  }
};

export const createRecreationSiteBoundaryLayer = () =>
  new VectorLayer({
    source: recreationSiteBoundarySource,
    style: (feature) => createRecreationSiteBoundaryStyle(feature),
    minZoom: ZOOM_LEVELS.REGION,
  });
