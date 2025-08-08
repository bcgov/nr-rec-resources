import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RefObject } from 'react';
import type OLMap from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import { transformExtent } from 'ol/proj';

export const useZoomToExtent = (
  mapRef: RefObject<{ getMap: () => OLMap } | null>,
  extent?: string,
) => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') ?? '';

  // Keep track of previous filter param to detect clearing
  const prevFilterRef = useRef<string>('');

  useEffect(() => {
    if (!extent || !mapRef.current) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    const wasCleared = prevFilterRef.current && !filterParam;
    prevFilterRef.current = filterParam;

    if (wasCleared) {
      return;
    }

    try {
      const geojson = JSON.parse(extent);
      const format = new GeoJSON();
      const geometry = format.readGeometry(geojson);
      const olExtent3005 = geometry.getExtent();

      const olExtent3857 = transformExtent(
        olExtent3005,
        'EPSG:3005',
        'EPSG:3857',
      );

      const view = map.getView();

      map.once('moveend', () => {
        // Nudge the zoom level slightly to fix white tile rendering issue
        const zoom = view.getZoom();
        if (zoom != null) {
          view.setZoom(zoom + 0.01);
        }
      });

      view.fit(olExtent3857, {
        padding: [50, 50, 50, 50],
        maxZoom: 16,
        duration: 500,
      });
    } catch (err) {
      console.error('Failed to parse or fit extent:', err);
    }
    // eslint-disable-next-line
  }, [extent, mapRef]);
};
