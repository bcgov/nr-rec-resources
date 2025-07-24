import { useCallback } from 'react';
import { useStore } from '@tanstack/react-store';
import currentLocationStore from '@/store/currentLocationStore';

export const useCurrentLocation = () => {
  const state = useStore(currentLocationStore);

  const getLocation = useCallback((): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation not supported';
        currentLocationStore.setState((prev) => ({
          ...prev,
          error,
        }));
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          currentLocationStore.setState((prev) => ({
            ...prev,
            latitude,
            longitude,
            error: undefined,
            permissionDeniedCount: 0,
          }));

          resolve({ latitude, longitude }); // ✅ Return coordinates here
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
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }, []);

  return {
    ...state,
    getLocation,
  };
};
