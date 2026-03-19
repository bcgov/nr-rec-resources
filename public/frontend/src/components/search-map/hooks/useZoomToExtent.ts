import { useEffect, useRef, useState } from 'react';
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
  const [fitView, setFitView] = useState(true);

  const checkRestore = () => {
    const lastZoom = sessionStorage.getItem('locationZoomState');
    const lastCenter = sessionStorage.getItem('locationCenterState');
    if (lastZoom != null && lastCenter != null) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    console.log('useZoomToExtent start');
    if (!extent || !mapRef.current) return;
    console.log('useZoomToExtent extent');
    const map = mapRef.current.getMap();
    if (!map) return;
    console.log('useZoomToExtent map');

    const view = map.getView();

    const clearLocation = () => {
      sessionStorage.removeItem('locationZoomState');
      sessionStorage.removeItem('locationCenterState');
    };

    const restoreLocation = () => {
      const lastZoom = sessionStorage.getItem('locationZoomState');
      const lastCenter = sessionStorage.getItem('locationCenterState');

      console.log('restoreLocation 3', lastCenter, lastZoom);

      if (lastZoom != null && lastCenter != null) {
        try {
          const zoom = Number(lastZoom);
          const center = JSON.parse(lastCenter);

          if (!isNaN(zoom) && Array.isArray(center) && center.length === 2) {
            console.log('Set Zoom !!!');
            view.setCenter(center);
            view.setZoom(zoom);
            clearLocation();
          }
        } catch (e) {
          console.warn('Failed to restore location', e);
        }
      }
    };

    if (checkRestore()) {
      restoreLocation();
    }

    // Skip on initial load - only run when extent changes after map is initialized
    if (!isMapInitialized.current) {
      isMapInitialized.current = true;
      return;
    }
    console.log('useZoomToExtent isMapInitialized');
    // If the search input was cleared, do not zoom to extent
    if (wasCleared) {
      searchInputStore.setState((prev) => ({
        ...prev,
        wasCleared: false,
      }));
      return;
    }
    console.log('useZoomToExtent wasCleared');

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

      map.once('moveend', () => {
        const zoom = view.getZoom();
        if (zoom != null) {
          view.setZoom(zoom + 0.01);
        }
      });

      const mapSize = map.getSize(); // [width, height]
      if (mapSize) {
        console.log('Fit zoom', fitView);
        if (!checkRestore()) {
          const [width] = mapSize;
          const padding = calculateMapPadding(width);
          view.fit(olExtent3857, { padding, maxZoom: 16, duration: 500 });
        }
      }
    } catch (err) {
      console.error('Failed to parse or fit extent:', err);
    }
    // eslint-disable-next-line
  }, [extent, mapRef]);
};
