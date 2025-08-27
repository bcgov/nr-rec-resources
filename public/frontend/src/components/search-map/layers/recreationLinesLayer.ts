import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Stroke } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { RECREATION_LINES_LAYER } from '@/components/search-map/constants';

const RECREATION_LINE_FIELDS = ['OBJECTID', 'LIFE_CYCLE_STATUS_CODE'];

export const createRecreationLineStyle = (
  _feature: FeatureLike,
  isHovered = false,
) => {
  const color = '#7BC371';

  return new Style({
    stroke: new Stroke({
      color: isHovered ? 'rgba(255, 0, 255, 1)' : color,
      width: isHovered ? 4 : 2,
      lineDash: [10, 5],
    }),
  });
};

export const createRecreationLinesSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');

      return (
        `${RECREATION_LINES_LAYER}/query/?` +
        `f=json` +
        `&outFields=${RECREATION_LINE_FIELDS.join(',')}` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&inSR=102100` +
        `&outSR=102100` +
        `&where=LIFE_CYCLE_STATUS_CODE='ACTIVE'`
      );
    },
    strategy: bboxStrategy,
    wrapX: false,
  });

export const createRecreationLinesLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: (feature, resolution) => {
      console.log('Current resolution:', resolution);
      return resolution < 500 ? createRecreationLineStyle(feature) : undefined;
    },
  });
