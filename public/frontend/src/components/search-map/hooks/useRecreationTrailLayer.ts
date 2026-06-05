import { useCallback } from 'react';
import type Feature from 'ol/Feature';
import type VectorSource from 'ol/source/Vector';
import { useLayer } from '@/components/search-map/hooks/useLayer';
import { useViewportIdFetch } from '@/components/search-map/hooks/useViewportIdFetch';
import { fetchBcgwFeaturesByIds } from '@/components/search-map/layers/bcgwFeatures';
import {
  BCGW_PROXY_URL,
  BCGW_RECREATION_TRAIL_LAYER,
} from '@/components/search-map/constants';
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
  // Cluster inner pin source — the spatial index of search results in view.
  pinSource: VectorSource | null;
}

export const useRecreationTrailLayer = (
  mapRef: MapRef,
  options: UseRecreationTrailLayerOptions,
) => {
  const { pinSource, ...layerOptions } = options;

  const { layer, source } = useLayer(
    mapRef,
    createRecreationTrailSource,
    createRecreationTrailLayer,
    createRecreationTrailStyle,
    layerOptions,
  );

  const fetchByIds = useCallback(
    (ids: string[]): Promise<Feature[]> =>
      fetchBcgwFeaturesByIds({
        url: BCGW_PROXY_URL,
        layer: BCGW_RECREATION_TRAIL_LAYER,
        ids,
      }),
    [],
  );

  useViewportIdFetch({
    mapRef,
    pinSource,
    source,
    minZoom: layerOptions.hideBelowZoom ?? 0,
    fetchByIds,
  });

  return { layer };
};
