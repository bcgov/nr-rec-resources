import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { tile as tileStrategy } from 'ol/loadingstrategy';
import { createXYZ } from 'ol/tilegrid';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import {
  locationDotBlueIcon,
  locationDotRedIcon,
} from '@/components/search/SearchMap/mapStyles';
import {
  MAP_LAYER_OPTIONS,
  RECREATION_FEATURE_LAYER,
} from '@/components/search/SearchMap/constants';

//
// This file should be moved back to the shared map repo once map development has matured
// https://github.com/bcgov/prp-map/blob/main/src/layers/recreationFeatureLayer.ts

const labelTextCache = new Map<string, string>();

export const createRecreationIconStyle = (filteredIds: string[] = []) => {
  const filteredSet = new Set(filteredIds);

  return (feature: FeatureLike): Style | undefined => {
    const id = feature.get('FOREST_FILE_ID');

    if (filteredSet.size > 0 && !filteredSet.has(id)) return undefined;

    const name = feature.get('PROJECT_NAME');

    const isClosed = feature.get('CLOSURE_IND') === 'Y';

    const icon = isClosed
      ? locationDotRedIcon.getImage()
      : locationDotBlueIcon.getImage();

    return new Style({
      image: icon ?? undefined,
      text: new Text({
        text: name,
        font: '14px BC Sans,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
        offsetY: -28,
      }),
    });
  };
};

export const createRecreationFeatureSource = (options?: {
  tileSize?: number;
  wrapX?: boolean;
}) =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');
      return (
        `${RECREATION_FEATURE_LAYER}/query/?` +
        `f=json` +
        `&where=1=1` +
        `&outFields=PROJECT_NAME,CLOSURE_IND,FOREST_FILE_ID` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: tileStrategy(
      createXYZ({ tileSize: options?.tileSize ?? MAP_LAYER_OPTIONS.TILE_SIZE }),
    ),
    wrapX: options?.wrapX ?? false,
  });

export const createRecreationFeatureLayer = (
  source: VectorSource,
  style: (
    feature: FeatureLike,
    resolution?: number,
  ) => Style | Style[] | undefined,
  options?: {
    declutter?: boolean | string;
    maxTextResolution: number;
    updateWhileInteracting?: boolean;
    updateWhileAnimating?: boolean;
    renderBuffer?: number;
  },
) =>
  new VectorLayer({
    source,
    style,
    declutter: options?.declutter ?? true,
    updateWhileInteracting: options?.updateWhileInteracting ?? true,
    updateWhileAnimating: options?.updateWhileAnimating ?? true,
    renderBuffer: options?.renderBuffer ?? 300,
  });
