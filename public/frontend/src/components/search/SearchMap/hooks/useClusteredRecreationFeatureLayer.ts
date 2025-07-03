import { useEffect, useMemo, useRef } from 'react';
import {
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureStyle,
  createClusteredRecreationFeatureLayer,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';

export const useClusteredRecreationFeatureLayer = (
  recResourceIds: string[],
  options?: {
    animationDuration?: number;
    declutter?: boolean;
    updateWhileAnimating?: boolean;
    updateWhileInteracting?: boolean;
    renderBuffer?: number;
  },
) => {
  const clusteredSource = useMemo(
    () => createClusteredRecreationFeatureSource(recResourceIds),
    [recResourceIds],
  );

  const clusteredStyle = useMemo(
    () => createClusteredRecreationFeatureStyle(recResourceIds),
    [recResourceIds],
  );

  const layerRef = useRef(
    createClusteredRecreationFeatureLayer(
      clusteredSource,
      clusteredStyle,
      options,
    ),
  );

  // Update source when filtered IDs change
  useEffect(() => {
    const newSource = createClusteredRecreationFeatureSource(recResourceIds);
    layerRef.current.setSource(newSource);
  }, [recResourceIds]);

  return {
    layer: layerRef.current,
    source: clusteredSource,
    style: clusteredStyle,
  };
};
