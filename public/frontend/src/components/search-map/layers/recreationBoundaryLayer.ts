import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style, Fill, Stroke } from 'ol/style';

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

// Empty source; geometry is loaded incrementally by useViewportIdFetch, which
// fetches only the boundaries for search results currently in the viewport.
export const createRecreationBoundarySource = () =>
  new VectorSource({
    format: new EsriJSON(),
    wrapX: false,
  });

export const createRecreationBoundaryLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: createRecreationBoundaryStyle,
  });
