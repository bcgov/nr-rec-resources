import { useEffect } from 'react';
import { useLayer } from '@/components/search-map/hooks/useLayer';
import { UseLayerOptions } from '@/components/search-map/hooks/types';
import {
  createRecreationLinesLayer,
  createRecreationLinesSource,
  createRecreationLineStyle,
  recreationLinesSource,
  loadFeaturesForFilteredIds,
} from '@/components/search-map/layers/recreationLinesLayer';

export const useRecreationLinesLayer = (
  recResourceIds: string[],
  mapRef: React.RefObject<{
    getMap: () => any;
  } | null>,
  options?: UseLayerOptions,
) => {
  const result = useLayer(
    mapRef,
    createRecreationLinesSource,
    createRecreationLinesLayer,
    createRecreationLineStyle,
    options,
  );

  useEffect(() => {
    if (!recResourceIds.length) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const projection = map.getView().getProjection();
    loadFeaturesForFilteredIds(
      recResourceIds,
      recreationLinesSource,
      projection,
    );
  }, [recResourceIds, mapRef]);

  return result;
};
