import {
  CLUSTER_DISTANCE_ZOOM_THRESHOLD,
  CLUSTER_DISTANCE_ZOOMED_IN,
  CLUSTER_DISTANCE_ZOOMED_OUT,
  CLUSTER_MIN_DISTANCE_ZOOMED_IN,
  CLUSTER_MIN_DISTANCE_ZOOMED_OUT,
} from '@/components/search-map/constants';

export interface ClusterDistanceOptions {
  distance: number;
  minDistance: number;
}

/**
 * Calculates the cluster distance and minDistance based on the current zoom level
 * @param zoom - Current zoom level
 * @param defaultDistance - Optional default distance to use when zoom is below threshold
 * @param defaultMinDistance - Optional default minDistance to use when zoom is below threshold
 * @returns An object containing both distance and minDistance
 */
export const getClusterDistance = (
  zoom: number | undefined,
  defaultDistance?: number,
  defaultMinDistance?: number,
): ClusterDistanceOptions => {
  const isZoomedInToThreshold =
    zoom !== undefined && zoom >= CLUSTER_DISTANCE_ZOOM_THRESHOLD;
  const distance = isZoomedInToThreshold
    ? CLUSTER_DISTANCE_ZOOMED_IN
    : (defaultDistance ?? CLUSTER_DISTANCE_ZOOMED_OUT);

  const minDistance = isZoomedInToThreshold
    ? CLUSTER_MIN_DISTANCE_ZOOMED_IN
    : (defaultMinDistance ?? CLUSTER_MIN_DISTANCE_ZOOMED_OUT);

  return { distance, minDistance };
};
