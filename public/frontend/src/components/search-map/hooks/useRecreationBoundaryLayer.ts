import { useCallback } from 'react';
import { useLayer } from '@/components/search-map/hooks/useLayer';
import type {
  MapRef,
  UseLayerOptions,
} from '@/components/search-map/hooks/types';
import {
  createRecreationBoundaryLayer,
  createRecreationBoundarySource,
  createRecreationBoundaryStyle,
} from '@/components/search-map/layers/recreationBoundaryLayer';

interface UseRecreationBoundaryLayerOptions extends UseLayerOptions {
  filteredIds: string[];
}

export const useRecreationBoundaryLayer = (
  mapRef: MapRef,
  options: UseRecreationBoundaryLayerOptions,
) => {
  const { filteredIds, ...layerOptions } = options;
  const createSource = useCallback(
    () => createRecreationBoundarySource(filteredIds),
    [filteredIds],
  );

  return useLayer(
    mapRef,
    createSource,
    createRecreationBoundaryLayer,
    createRecreationBoundaryStyle,
    layerOptions,
  );
};
