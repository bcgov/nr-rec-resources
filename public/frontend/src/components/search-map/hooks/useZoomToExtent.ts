import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type OLMap from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import searchInputStore from '@/store/searchInputStore';
import { useStore } from '@tanstack/react-store';
import { transformExtent } from 'ol/proj';
import { calculateMapPadding } from '@/components/search-map/utils';

export const useZoomToExtent = (
  mapRef: RefObject<{ getMap: () => OLMap } | null>,
  extent?: string,
) => {
  const { wasCleared } = useStore(searchInputStore);
  const isMapInitialized = useRef(false);

  useEffect(() => {
    if (!extent || !mapRef.current) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    // Skip on initial load - only run when extent changes after map is initialized
    if (!isMapInitialized.current) {
      isMapInitialized.current = true;
      return;
    }

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

        // Check if there is a stored location when the user clicks on the description
        // Set the zoom level and center last time the location was clicked
        // Clear the session items
        const lastZoom = sessionStorage.getItem('locationZoomState');
        const lastCenter = sessionStorage.getItem('locationCenterState');
        if (lastZoom && lastCenter) {
          view.setZoom(parseFloat(lastZoom) + 0.01);
          const coordinates = lastCenter.split(',');
          if (coordinates.length === 2) {
            view.setCenter([
              parseFloat(coordinates[0]),
              parseFloat(coordinates[1]),
            ]);
          }
          sessionStorage.removeItem('locationZoomState');
          sessionStorage.removeItem('locationCenterState');
        }
      });

      const mapSize = map.getSize(); // [width, height]
      if (mapSize) {
        const [width] = mapSize;
        const padding = calculateMapPadding(width);

        view.fit(olExtent3857, { padding, maxZoom: 16, duration: 500 });
      }
    } catch (err) {
      console.error('Failed to parse or fit extent:', err);
    }
    // eslint-disable-next-line
  }, [extent, mapRef]);
};
