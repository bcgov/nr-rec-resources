import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { tile as tileStrategy } from 'ol/loadingstrategy';
import { createXYZ } from 'ol/tilegrid';
import { Style, Fill, Icon, Stroke, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';
import {
  MAP_LAYER_OPTIONS,
  RECREATION_FEATURE_LAYER,
} from '@/components/search/SearchMap/constants';

//
// This file should be moved back to the shared map repo once map development has matured
// https://github.com/bcgov/prp-map/blob/main/src/layers/recreationFeatureLayer.ts

export const capitalizeWords = (str: string): string =>
  str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export function featureLabelText(text: string): Text {
  return new Text({
    text,
    font: '14px BC Sans,sans-serif',
    fill: new Fill({ color: '#000' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
    offsetY: -28,
  });
}

export const locationDotBlueIcon = new Style({
  image: new Icon({ src: locationDotBlue, scale: 0.3, anchor: [0.5, 1] }),
});

export const locationDotRedIcon = new Style({
  image: new Icon({ src: locationDotRed, scale: 0.3, anchor: [0.5, 1] }),
});

// Cache for styles and names to avoid unnecessary recalculations
const styleCache = new Map<string, Style>();
const nameCache = new Map<string, string>();

const getCapitalizedName = (name: string): string => {
  if (!nameCache.has(name)) {
    nameCache.set(name, capitalizeWords(name));
  }
  return nameCache.get(name)!;
};

export const createRecreationFeatureStyle = (
  maxTextResolution: number = MAP_LAYER_OPTIONS.MAX_TEXT_RESOLUTION,
) => {
  return (feature: FeatureLike, resolution: number) => {
    const isClosed = feature.get('CLOSURE_IND') === 'Y';
    const name = feature.get('PROJECT_NAME');

    const isLabelVisible = resolution < maxTextResolution;
    const label = isLabelVisible ? getCapitalizedName(name) : '';
    const key = `${isClosed}-${label}`;

    if (!styleCache.has(key)) {
      const icon = isClosed
        ? locationDotRedIcon.getImage()
        : locationDotBlueIcon.getImage();

      const style = new Style({
        image: icon ?? undefined,
        text: label ? featureLabelText(label) : undefined,
      });

      styleCache.set(key, style);
    }

    return styleCache.get(key)!;
  };
};

export const createRecreationFeatureSource = (
  tileSize: number = MAP_LAYER_OPTIONS.TILE_SIZE,
  recResourceIds?: string[], // Optional filter for specific recResourceIds
) =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');
      const baseWhere = '1=1';
      let forestFilter = '';
      if (recResourceIds && recResourceIds.length > 0) {
        const quotedIds = recResourceIds.map((id) => `'${id}'`).join(',');
        forestFilter = `AND FOREST_FILE_ID IN (${quotedIds})`;
      }

      return (
        `${RECREATION_FEATURE_LAYER}/query/?` +
        `f=json` +
        `&where=${encodeURIComponent(`${baseWhere} ${forestFilter}`)}` +
        `&outFields=PROJECT_NAME,CLOSURE_IND,FOREST_FILE_ID` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: tileStrategy(createXYZ({ tileSize })),
    wrapX: false,
  });

export const createRecreationFeatureLayer = (
  source: VectorSource,
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
    style: createRecreationFeatureStyle(
      options?.maxTextResolution ?? MAP_LAYER_OPTIONS.MAX_TEXT_RESOLUTION,
    ),
    declutter: options?.declutter ?? true,
    updateWhileInteracting: options?.updateWhileInteracting ?? true,
    updateWhileAnimating: options?.updateWhileAnimating ?? true,
    renderBuffer: options?.renderBuffer ?? 300,
  });
