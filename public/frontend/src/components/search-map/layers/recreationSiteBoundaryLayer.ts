import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Stroke, Fill } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { RECREATION_SITE_BOUNDARY_LAYER } from '@/components/search-map/constants';

const RECREATION_SITE_BOUNDARY_FIELDS = ['OBJECTID'];

export const createRecreationSiteBoundaryStyle = (
  _feature: FeatureLike,
  isHovered = false,
) => {
  const strokeColor = isHovered ? 'rgba(255,0,255,1)' : 'rgba(45,128,32,0.6)';

  return new Style({
    stroke: new Stroke({
      color: strokeColor,
      width: isHovered ? 3 : 2,
    }),
    fill: new Fill({
      color: 'rgba(45,128,32,0.1)',
    }),
  });
};

export const createRecreationSiteBoundarySource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');

      return (
        `${RECREATION_SITE_BOUNDARY_LAYER}/query/?` +
        `f=json` +
        `&outFields=${RECREATION_SITE_BOUNDARY_FIELDS.join(',')}` +
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

export const createRecreationSiteBoundaryLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: (feature, resolution) =>
      resolution < 500 ? createRecreationSiteBoundaryStyle(feature) : undefined,
  });
