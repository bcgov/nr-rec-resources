import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style, Fill, Stroke } from 'ol/style';
import { BCGW_PROXY_URL } from '@/components/search-map/constants';
import { fetchBcgwFeaturesByIds } from '@/components/search-map/layers/bcgwFeatures';

const BOUNDARY_STROKE_COLOR = '#42814A';
const BOUNDARY_FILL_COLOR = '#42814A66';

export const createRecreationBoundaryStyle = () =>
  new Style({
    stroke: new Stroke({
      color: BOUNDARY_STROKE_COLOR,
      width: 3,
    }),
    fill: new Fill({
      color: BOUNDARY_FILL_COLOR,
    }),
  });

export const createRecreationBoundarySource = (filteredIds: string[]) => {
  const source = new VectorSource({
    format: new EsriJSON(),
    wrapX: false,
  });

  source.setLoader(async () => {
    if (filteredIds.length === 0) return;
    const features = await fetchBcgwFeaturesByIds({
      url: BCGW_PROXY_URL,
      layer: '5',
      ids: filteredIds,
    });
    source.addFeatures(features);
  });

  return source;
};

export const createRecreationBoundaryLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: createRecreationBoundaryStyle,
  });
