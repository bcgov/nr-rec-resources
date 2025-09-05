import { useEffect } from 'react';
import { useLayer } from '@/components/search-map/hooks/useLayer';
import { UseLayerOptions } from '@/components/search-map/hooks/types';
import {
  createRecreationSiteBoundaryLayer,
  createRecreationSiteBoundarySource,
  createRecreationSiteBoundaryStyle,
  recreationSiteBoundarySource,
  loadFeaturesForFilteredIds,
} from '@/components/search-map/layers/recreationSiteBoundaryLayer';

export const useRecreationSiteBoundaryLayer = (
  recResourceIds: string[],
  mapRef: React.RefObject<{
    getMap: () => any;
  } | null>,
  options?: UseLayerOptions,
) => {
  const result = useLayer(
    mapRef,
    createRecreationSiteBoundarySource,
    createRecreationSiteBoundaryLayer,
    createRecreationSiteBoundaryStyle,
    options,
  );

  useEffect(() => {
    if (!recResourceIds.length) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const projection = map.getView().getProjection();
    loadFeaturesForFilteredIds(
      recResourceIds,
      recreationSiteBoundarySource,
      projection,
    );
  }, [recResourceIds, mapRef]);

  return result;
};
