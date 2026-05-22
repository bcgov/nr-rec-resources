import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createRecreationTrailLayer,
  createRecreationTrailSource,
  createRecreationTrailStyle,
} from '@/components/search-map/layers/recreationTrailLayer';

export const useRecreationTrailLayer: UseLayer = (mapRef, options) =>
  useLayer(
    mapRef,
    createRecreationTrailSource,
    createRecreationTrailLayer,
    createRecreationTrailStyle,
    options,
  );
