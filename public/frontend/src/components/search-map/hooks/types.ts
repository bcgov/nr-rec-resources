import { RefObject } from 'react';
import OLMap from 'ol/Map';

export type UseLayerOptions = {
  applyHoverStyles?: boolean;
};

export type MapRef = RefObject<{ getMap: () => OLMap } | null>;
