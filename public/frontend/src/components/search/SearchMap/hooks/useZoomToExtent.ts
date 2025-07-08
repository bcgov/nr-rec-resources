import { useEffect } from 'react';
import type { RefObject } from 'react';
import type OLMap from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import { transformExtent } from 'ol/proj';

export const useZoomToExtent = (
  mapRef: RefObject<{ getMap: () => OLMap } | null>,
  extent?: string,
) => {
  useEffect(() => {
    if (!extent || !mapRef.current) return;

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

      const map = mapRef.current.getMap();
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
  }, [extent, mapRef]);
};
