import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style, Stroke } from 'ol/style';
import { BCGW_PROXY_URL } from '@/components/search-map/constants';
import { fetchBcgwFeaturesByIds } from '@/components/search-map/layers/bcgwFeatures';

const TRAIL_COLOR = '#42814A';

export const createRecreationTrailStyle = () =>
  new Style({
    stroke: new Stroke({
      color: TRAIL_COLOR,
      width: 3,
      lineDash: [6, 6],
    }),
  });

export const createRecreationTrailSource = (filteredIds: string[]) => {
  const source = new VectorSource({
    format: new EsriJSON(),
    wrapX: false,
  });

  source.setLoader(async () => {
    if (filteredIds.length === 0) return;
    const features = await fetchBcgwFeaturesByIds({
      url: BCGW_PROXY_URL,
      layer: '3',
      ids: filteredIds,
    });
    source.addFeatures(features);
  });

  return source;
};

export const createRecreationTrailLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: createRecreationTrailStyle,
  });
