import { useCallback } from 'react';
import { useStore } from '@tanstack/react-store';
import currentLocationStore from '@/store/currentLocationStore';

export const useCurrentLocation = () => {
  const state = useStore(currentLocationStore);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      currentLocationStore.setState((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocationStore.setState((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: undefined,
          permissionDeniedCount: 0,
        }));
      },
      (err) => {
        currentLocationStore.setState((prev) => ({
          ...prev,
          latitude: null,
          longitude: null,
          error: err.message,
          permissionDeniedCount:
            err.code === err.PERMISSION_DENIED
              ? prev.permissionDeniedCount + 1
              : prev.permissionDeniedCount,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  return {
    ...state,
    getLocation,
  };
};
