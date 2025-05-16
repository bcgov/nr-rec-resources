import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import { trackEvent } from '@/utils/matomo';

export const useOpenLayersTracking = (map: Map) => {
  const isZooming = useRef(false);
  const isDragging = useRef(false);

  useEffect(() => {
    const handlePointerDrag = () => {
      isDragging.current = true;
    };

    const handleWheel = () => {
      isZooming.current = true;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        isZooming.current = true;
      }
    };

    const handleMoveEnd = () => {
      if (isZooming.current) {
        trackEvent({
          category: 'Map',
          action: 'Touch event',
          name: 'Zoomed in/out',
        });
      } else if (isDragging.current) {
        trackEvent({
          category: 'Map',
          action: 'Touch event',
          name: 'Panned',
        });
      }

      isZooming.current = false;
      isDragging.current = false;
    };

    map.on('pointerdrag', handlePointerDrag);
    map.on('moveend', handleMoveEnd);

    const viewport = map.getViewport();
    viewport.addEventListener('wheel', handleWheel);
    viewport.addEventListener('touchstart', handleTouchStart);

    return () => {
      map.un('pointerdrag', handlePointerDrag);
      map.un('moveend', handleMoveEnd);
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('touchstart', handleTouchStart);
    };
  }, [map]);
};
