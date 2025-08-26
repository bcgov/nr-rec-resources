import { useEffect } from 'react';
import type { RefObject } from 'react';
import type OLMap from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import searchInputStore from '@/store/searchInputStore';
import { useStore } from '@tanstack/react-store';
import { transformExtent } from 'ol/proj';

export const useZoomToExtent = (
  mapRef: RefObject<{ getMap: () => OLMap } | null>,
  extent?: string,
) => {
  const { wasCleared } = useStore(searchInputStore);

  useEffect(() => {
    if (!extent || !mapRef.current) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    // If the search input was cleared, do not zoom to extent
    if (wasCleared) {
      searchInputStore.setState((prev) => ({
        ...prev,
        wasCleared: false,
      }));
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

      const mapSize = map.getSize(); // [width, height]
      if (mapSize) {
        const [width] = mapSize;

        let padding;
        // [top, right, bottom, left]
        if (width >= 1200) {
          // Desktop
          padding = [150, 250, 300, 250];
        } else if (width >= 576) {
          // Tablet / small desktop
          padding = [150, 200, 250, 200];
        } else {
          // Mobile (small padding)
          padding = [50, 50, 50, 50];
        }

        view.fit(olExtent3857, { padding, maxZoom: 16, duration: 500 });
      }
    } catch (err) {
      console.error('Failed to parse or fit extent:', err);
    }
    // eslint-disable-next-line
  }, [extent, mapRef]);
};
