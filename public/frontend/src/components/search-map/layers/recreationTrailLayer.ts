import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style, Stroke } from 'ol/style';

const TRAIL_COLOR = '#42814A';

export const createRecreationTrailStyle = () =>
  new Style({
    stroke: new Stroke({
      color: TRAIL_COLOR,
      width: 3,
      lineDash: [6, 6],
    }),
  });

// Empty source; geometry is loaded incrementally by useViewportIdFetch, which
// fetches only the trails for search results currently in the viewport.
export const createRecreationTrailSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    wrapX: false,
  });

export const createRecreationTrailLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: createRecreationTrailStyle,
  });
