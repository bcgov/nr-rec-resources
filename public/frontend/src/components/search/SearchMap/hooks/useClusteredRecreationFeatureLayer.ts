import { useEffect, useMemo, useRef } from 'react';
import { Options as ClusterOptions } from 'ol/source/Cluster';
import {
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureStyle,
  createClusteredRecreationFeatureLayer,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import { AnimatedClusterOptions } from '@/components/search/SearchMap/types';

export const useClusteredRecreationFeatureLayer = (
  recResourceIds: string[],
  options?: {
    clusterOptions?: ClusterOptions;
    animatedClusterOptions?: AnimatedClusterOptions;
  },
) => {
  const clusteredSource = useMemo(
    () =>
      createClusteredRecreationFeatureSource(
        recResourceIds,
        options?.clusterOptions,
      ),
    [options, recResourceIds],
  );

  const layerRef = useRef(
    createClusteredRecreationFeatureLayer(
      clusteredSource,
      createClusteredRecreationFeatureStyle,
      options?.animatedClusterOptions,
    ),
  );

  useEffect(() => {
    const newSource = createClusteredRecreationFeatureSource(
      recResourceIds,
      options?.clusterOptions,
    );
    layerRef.current.setSource(newSource);
  }, [options, recResourceIds]);

  return {
    layer: layerRef.current,
    source: clusteredSource,
    style: createClusteredRecreationFeatureStyle,
  };
};
