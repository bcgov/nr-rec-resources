import { useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import type OLMap from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';
import searchInputStore from '@/store/searchInputStore';
import { useStore } from '@tanstack/react-store';
import { transformExtent } from 'ol/proj';
import { calculateMapPadding } from '@/components/search-map/utils';
import { Feature } from 'ol';

export const useZoomToExtent = (
  mapRef: RefObject<{ getMap: () => OLMap } | null>,
  extent?: string,
) => {
  const { wasCleared } = useStore(searchInputStore);
  const isMapInitialized = useRef(false);
  const suppressNextFit = useRef(false);

  const checkRestore = () => {
    const lastZoom = sessionStorage.getItem('locationZoomState');
    const lastCenter = sessionStorage.getItem('locationCenterState');
    if (lastZoom != null && lastCenter != null) {
      return true;
    }

    return false;
  };

  const zoomToFeature = useCallback(
    (feature: Feature) => {
      if (!mapRef.current) return;

      const map = mapRef.current.getMap();
      if (!map) return;

      const view = map.getView();
      const geometry = feature.getGeometry();

      if (geometry) {
        const extent = geometry.getExtent();
        const center = getCenter(extent);
        suppressNextFit.current = true;
        view.setCenter(center);
        view.setZoom(15);
      }
    },
    [mapRef],
  );

  useEffect(() => {
    if (!extent || !mapRef.current) return;

    if (suppressNextFit.current) {
      suppressNextFit.current = false;
      return;
    }
    const map = mapRef.current.getMap();
    if (!map) return;

    const view = map.getView();

    const clearLocation = () => {
      sessionStorage.removeItem('locationZoomState');
      sessionStorage.removeItem('locationCenterState');
    };

    const restoreLocation = () => {
      const lastZoom = sessionStorage.getItem('locationZoomState');
      const lastCenter = sessionStorage.getItem('locationCenterState');

      if (lastZoom != null && lastCenter != null) {
        try {
          const zoom = Number(lastZoom);
          const center = JSON.parse(lastCenter);

          if (
            !Number.isNaN(zoom) &&
            Array.isArray(center) &&
            center.length === 2
          ) {
            view.setCenter(center);
            view.setZoom(zoom);
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
      clearLocation();
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

      map.once('moveend', () => {
        const zoom = view.getZoom();
        if (zoom != null) {
          view.setZoom(zoom + 0.01);
        }
      });

      const mapSize = map.getSize(); // [width, height]
      if (mapSize) {
        if (!checkRestore()) {
          const [width] = mapSize;
          const padding = calculateMapPadding(width);
          view.fit(olExtent3857, { padding, maxZoom: 16, duration: 500 });
        }
      }
      clearLocation();
    } catch (err) {
      console.error('Failed to parse or fit extent:', err);
    }
    // eslint-disable-next-line
  }, [extent, mapRef]);

  return { zoomToFeature };
};
