import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Fill, Stroke } from 'ol/style';
import { BCGW_PROXY_URL } from '@/components/search-map/constants';

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

export const createRecreationBoundarySource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => `${BCGW_PROXY_URL}?layer=5&extent=${extent.join(',')}`,
    strategy: bboxStrategy,
    wrapX: false,
  });

export const createRecreationBoundaryLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: createRecreationBoundaryStyle,
  });
