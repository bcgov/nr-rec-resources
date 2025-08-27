import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createRecreationSiteBoundaryLayer,
  createRecreationSiteBoundarySource,
  createRecreationSiteBoundaryStyle,
} from '@/components/search-map/layers/recreationSiteBoundaryLayer';

export const useRecreationSiteBoundaryLayer: UseLayer = (mapRef, options) =>
  useLayer(
    mapRef,
    createRecreationSiteBoundarySource,
    createRecreationSiteBoundaryLayer,
    createRecreationSiteBoundaryStyle,
    options,
  );
