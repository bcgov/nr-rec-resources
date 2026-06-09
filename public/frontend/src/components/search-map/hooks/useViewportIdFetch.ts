import { useEffect } from 'react';
import type Feature from 'ol/Feature';
import type VectorSource from 'ol/source/Vector';
import type { MapRef } from '@/components/search-map/hooks/types';

interface UseViewportIdFetchParams {
  mapRef: MapRef;
  // Cluster inner pin source: one point per search result, spatially indexed
  // and keyed by FOREST_FILE_ID. Used as the in-memory index of "results in view".
  pinSource: VectorSource | null;
  // The boundary/trail source that fetched geometry is added to.
  source: VectorSource | null;
  // Only fetch once the layer is visible (same threshold as hideBelowZoom).
  minZoom: number;
  // Fetches geometry for a bounded id list (the boundary or trail proxy call).
  fetchByIds: (ids: string[]) => Promise<Feature[]>;
}

/**
 * Drives geometry loading for the boundary/trail layers by the *viewport*
 * rather than the whole search result set.
 *
 * The earlier fetch-by-id approach POSTed every result id at once; with real
 * data that overran the request-size limit (HTTP 413). Here we ask the pin
 * source which results are actually on screen (`getFeaturesInExtent`) and fetch
 * only those, deduping so a pan requests only newly-revealed ids.
 *
 * Note this is a deliberate, narrow reuse of the pin source — a spatial query on
 * `moveend`, not the old per-feature render-time filter that was removed. It does
 * not reintroduce that coupling's render races.
 *
 * Triggers on `moveend` (pan/zoom) and on the pin source's `change` (pins
 * finishing their async load after the user is already past minZoom).
 */
export function useViewportIdFetch({
  mapRef,
  pinSource,
  source,
  minZoom,
  fetchByIds,
}: UseViewportIdFetchParams) {
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !pinSource || !source) return;

    // A new search yields a new pin source; drop stale geometry + dedup state.
    source.clear();
    const fetched = new Set<string>();
    const view = map.getView();
    let cancelled = false;

    const run = async () => {
      const zoom = view.getZoom() ?? 0;
      if (zoom < minZoom) return;

      const size = map.getSize();
      if (!size) return;

      const extent = view.calculateExtent(size);
      const newIds = Array.from(
        new Set(
          pinSource
            .getFeaturesInExtent(extent)
            .map((feature) => String(feature.getId()))
            .filter((id) => id && id !== 'undefined' && !fetched.has(id)),
        ),
      );
      if (newIds.length === 0) return;

      // Reserve ids up front so overlapping runs (rapid panning) don't refetch.
      newIds.forEach((id) => fetched.add(id));
      try {
        const features = await fetchByIds(newIds);
        if (!cancelled) source.addFeatures(features);
      } catch (error) {
        // Roll back so a later pan over the same area retries.
        newIds.forEach((id) => fetched.delete(id));
        console.error('Failed to fetch BCGW geometry by id', error);
      }
    };

    map.on('moveend', run);
    pinSource.on('change', run);
    run();

    return () => {
      cancelled = true;
      map.un('moveend', run);
      pinSource.un('change', run);
    };
  }, [mapRef, pinSource, source, minZoom, fetchByIds]);
}
