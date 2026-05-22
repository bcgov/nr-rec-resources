import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createRecreationBoundaryLayer,
  createRecreationBoundarySource,
  createRecreationBoundaryStyle,
} from '@/components/search-map/layers/recreationBoundaryLayer';

export const useRecreationBoundaryLayer: UseLayer = (mapRef, options) =>
  useLayer(
    mapRef,
    createRecreationBoundarySource,
    createRecreationBoundaryLayer,
    createRecreationBoundaryStyle,
    options,
  );
