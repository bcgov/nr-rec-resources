import { useState } from 'react';

interface Location {
  latitude: number | null;
  longitude: number | null;
  isLocationAllowed: boolean;
  error?: string;
  getLocation: () => void;
}

export const useCurrentLocation = (): Location => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLocationAllowed, setIsLocationAllowed] = useState<boolean>(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setIsLocationAllowed(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLocationAllowed(true);
        setError(undefined);
      },
      (err) => {
        setLatitude(null);
        setLongitude(null);
        setIsLocationAllowed(false);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return {
    latitude,
    longitude,
    isLocationAllowed,
    error,
    getLocation,
  };
};
