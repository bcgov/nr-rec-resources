import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Stroke } from 'ol/style';
import { BCGW_PROXY_URL } from '@/components/search-map/constants';

const TRAIL_COLOR = '#42814A';

export const createRecreationTrailStyle = () =>
  new Style({
    stroke: new Stroke({
      color: TRAIL_COLOR,
      width: 3,
      lineDash: [6, 6],
    }),
  });

export const createRecreationTrailSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => `${BCGW_PROXY_URL}?layer=3&extent=${extent.join(',')}`,
    strategy: bboxStrategy,
    wrapX: false,
  });

export const createRecreationTrailLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: createRecreationTrailStyle,
  });
