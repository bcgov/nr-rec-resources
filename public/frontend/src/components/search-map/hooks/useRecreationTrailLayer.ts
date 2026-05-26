import { useCallback } from 'react';
import { useLayer } from '@/components/search-map/hooks/useLayer';
import type {
  MapRef,
  UseLayerOptions,
} from '@/components/search-map/hooks/types';
import {
  createRecreationTrailLayer,
  createRecreationTrailSource,
  createRecreationTrailStyle,
} from '@/components/search-map/layers/recreationTrailLayer';

interface UseRecreationTrailLayerOptions extends UseLayerOptions {
  filteredIds: string[];
}

export const useRecreationTrailLayer = (
  mapRef: MapRef,
  options: UseRecreationTrailLayerOptions,
) => {
  const { filteredIds, ...layerOptions } = options;
  const createSource = useCallback(
    () => createRecreationTrailSource(filteredIds),
    [filteredIds],
  );

  return useLayer(
    mapRef,
    createSource,
    createRecreationTrailLayer,
    createRecreationTrailStyle,
    layerOptions,
  );
};
