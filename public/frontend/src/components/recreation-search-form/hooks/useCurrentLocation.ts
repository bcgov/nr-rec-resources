import { useState } from 'react';

interface Location {
  error?: string;
  getLocation: () => void;
  latitude: number | null;
  longitude: number | null;
  permissionDeniedCount: number;
}

export const useCurrentLocation = (): Location => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [permissionDeniedCount, setPermissionDeniedCount] = useState<number>(0);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setError(undefined);
      },
      (err) => {
        setLatitude(null);
        setLongitude(null);
        setError(err.message);

        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDeniedCount((prev) => prev + 1);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return {
    error,
    getLocation,
    latitude,
    longitude,
    permissionDeniedCount,
  };
};
