import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Fill, Stroke } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { WILDFIRE_AREA_RESTRICTION_LAYER } from '@/components/search-map/constants';

const WILDFIRE_AREA_RESTRICTION_FIELDS = [
  'NAME',
  'ACCESS_STATUS_EFFECTIVE_DATE',
  'FIRE_CENTRE_NAME',
  'FIRE_ZONE_NAME',
  'BULLETIN_URL',
  'OBJECTID',
];

/**
 * Creates a diagonal hatch canvas pattern for the area restriction fill.
 * Produces black diagonal lines on a transparent background.
 */
const createHatchPattern = (isHovered: boolean): CanvasPattern | null => {
  const size = 10;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = isHovered ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;

  // Draw a single diagonal line that tiles seamlessly
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  // Wrap-around segments so the tile is seamless
  ctx.moveTo(-1, 1);
  ctx.lineTo(1, -1);
  ctx.moveTo(size - 1, size + 1);
  ctx.lineTo(size + 1, size - 1);
  ctx.stroke();

  return ctx.createPattern(canvas, 'repeat');
};

export const createWildfireAreaRestrictionStyle = (
  _feature: FeatureLike,
  isHovered = false,
) => {
  const pattern = createHatchPattern(isHovered);

  return new Style({
    stroke: new Stroke({
      color: isHovered ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)',
      width: isHovered ? 2.5 : 1.5,
    }),
    fill: pattern
      ? new Fill({ color: pattern as unknown as string })
      : new Fill({ color: 'rgba(0,0,0,0.1)' }),
  });
};

export const createWildfireAreaRestrictionSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');
      return (
        `${WILDFIRE_AREA_RESTRICTION_LAYER}/query/?` +
        `f=json` +
        `&where=1%3D1` +
        `&outFields=${WILDFIRE_AREA_RESTRICTION_FIELDS.join(',')}` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&inSR=102100` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: bboxStrategy,
    wrapX: false,
  });

export const createWildfireAreaRestrictionLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: (feature) => createWildfireAreaRestrictionStyle(feature),
  });
