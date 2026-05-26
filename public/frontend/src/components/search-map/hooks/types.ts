import { RefObject } from 'react';
import OLMap from 'ol/Map';
import type Feature from 'ol/Feature';
import type Style from 'ol/style/Style';

export type UseLayerOptions = {
  hideBelowZoom?: number;
  applyHoverStyles?: boolean;
};

export type MapRef = RefObject<{ getMap: () => OLMap } | null>;

export interface FeatureLayerConfig {
  id: string;
  layer: any; // You can tighten this type if using ol/layer/Vector
  onFeatureSelect: (feature: Feature | null) => void;
  selectedStyle?: Style | ((feature: Feature) => Style);
}

export interface SelectedFeatureInfo {
  feature: Feature;
  layerId: string;
}
