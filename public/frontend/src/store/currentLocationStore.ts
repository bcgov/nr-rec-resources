import { Store } from '@tanstack/store';

interface CurrentLocationState {
  latitude: number | null;
  longitude: number | null;
  error?: string;
  permissionDeniedCount: number;
}

const initialCurrentLocationState: CurrentLocationState = {
  latitude: null,
  longitude: null,
  error: undefined,
  permissionDeniedCount: 0,
};

const currentLocationStore = new Store<CurrentLocationState>(
  initialCurrentLocationState,
);

export default currentLocationStore;
