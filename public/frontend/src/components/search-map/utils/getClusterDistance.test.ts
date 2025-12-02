import { describe, it, expect } from 'vitest';
import { getClusterDistance } from './getClusterDistance';
import {
  CLUSTER_DISTANCE_ZOOM_THRESHOLD,
  CLUSTER_DISTANCE_ZOOMED_IN,
  CLUSTER_DISTANCE_ZOOMED_OUT,
  CLUSTER_MIN_DISTANCE_ZOOMED_IN,
  CLUSTER_MIN_DISTANCE_ZOOMED_OUT,
} from '@/components/search-map/constants';

describe('getClusterDistance', () => {
  it('should return zoomed in distance and minDistance (both 0) when zoom >= threshold', () => {
    const result = getClusterDistance(CLUSTER_DISTANCE_ZOOM_THRESHOLD);
    expect(result.distance).toBe(CLUSTER_DISTANCE_ZOOMED_IN);
    expect(result.minDistance).toBe(CLUSTER_MIN_DISTANCE_ZOOMED_IN);

    const result2 = getClusterDistance(CLUSTER_DISTANCE_ZOOM_THRESHOLD + 5);
    expect(result2.distance).toBe(CLUSTER_DISTANCE_ZOOMED_IN);
    expect(result2.minDistance).toBe(CLUSTER_MIN_DISTANCE_ZOOMED_IN);
  });

  it('should return zoomed out distance and minDistance when zoom < threshold or undefined', () => {
    const result = getClusterDistance(CLUSTER_DISTANCE_ZOOM_THRESHOLD - 1);
    expect(result.distance).toBe(CLUSTER_DISTANCE_ZOOMED_OUT);
    expect(result.minDistance).toBe(CLUSTER_MIN_DISTANCE_ZOOMED_OUT);

    const result2 = getClusterDistance(undefined);
    expect(result2.distance).toBe(CLUSTER_DISTANCE_ZOOMED_OUT);
    expect(result2.minDistance).toBe(CLUSTER_MIN_DISTANCE_ZOOMED_OUT);
  });

  it('should use defaultDistance when zoom < threshold', () => {
    const customDistance = 75;
    const result = getClusterDistance(5, customDistance);
    expect(result.distance).toBe(customDistance);
    expect(result.minDistance).toBe(CLUSTER_MIN_DISTANCE_ZOOMED_OUT);

    const result2 = getClusterDistance(15, customDistance);
    expect(result2.distance).toBe(CLUSTER_DISTANCE_ZOOMED_IN);
    expect(result2.minDistance).toBe(CLUSTER_MIN_DISTANCE_ZOOMED_IN);
  });

  it('should use defaultMinDistance when provided and zoom < threshold', () => {
    const customMinDistance = 15;
    const result = getClusterDistance(5, undefined, customMinDistance);
    expect(result.distance).toBe(CLUSTER_DISTANCE_ZOOMED_OUT);
    expect(result.minDistance).toBe(customMinDistance);

    // When zoomed in, minDistance should be 0 regardless of defaultMinDistance
    const result2 = getClusterDistance(15, undefined, customMinDistance);
    expect(result2.distance).toBe(CLUSTER_DISTANCE_ZOOMED_IN);
    expect(result2.minDistance).toBe(CLUSTER_MIN_DISTANCE_ZOOMED_IN);
  });
});
