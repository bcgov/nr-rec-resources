import { useCallback } from 'react';
import type Feature from 'ol/Feature';
import type VectorSource from 'ol/source/Vector';
import { useLayer } from '@/components/search-map/hooks/useLayer';
import { useViewportIdFetch } from '@/components/search-map/hooks/useViewportIdFetch';
import { fetchBcgwFeaturesByIds } from '@/components/search-map/layers/bcgwFeatures';
import {
  BCGW_PROXY_URL,
  BCGW_RECREATION_BOUNDARY_LAYER,
} from '@/components/search-map/constants';
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
  // Cluster inner pin source — the spatial index of search results in view.
  pinSource: VectorSource | null;
}

export const useRecreationBoundaryLayer = (
  mapRef: MapRef,
  options: UseRecreationBoundaryLayerOptions,
) => {
  const { pinSource, ...layerOptions } = options;

  const { layer, source } = useLayer(
    mapRef,
    createRecreationBoundarySource,
    createRecreationBoundaryLayer,
    createRecreationBoundaryStyle,
    layerOptions,
  );

  const fetchByIds = useCallback(
    (ids: string[]): Promise<Feature[]> =>
      fetchBcgwFeaturesByIds({
        url: BCGW_PROXY_URL,
        layer: BCGW_RECREATION_BOUNDARY_LAYER,
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
