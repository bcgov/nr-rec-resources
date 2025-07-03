import { useEffect, useRef } from 'react';
import { Options as ClusterOptions } from 'ol/source/Cluster';
import {
  recreationSource,
  loadFeaturesForFilteredIds,
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureStyle,
  createClusteredRecreationFeatureLayer,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import { AnimatedClusterOptions } from '@/components/search/SearchMap/types';

export const useClusteredRecreationFeatureLayer = (
  recResourceIds: string[],
  mapProjection: string,
  options?: {
    clusterOptions?: ClusterOptions;
    animatedClusterOptions?: AnimatedClusterOptions;
  },
) => {
  const clusterSourceRef = useRef(
    createClusteredRecreationFeatureSource(options?.clusterOptions),
  );

  const layerRef = useRef(
    createClusteredRecreationFeatureLayer(
      clusterSourceRef.current,
      createClusteredRecreationFeatureStyle,
      options?.animatedClusterOptions,
    ),
  );

  useEffect(() => {
    if (!mapProjection) return;
    loadFeaturesForFilteredIds(recResourceIds, recreationSource, mapProjection);
  }, [recResourceIds, mapProjection]);

  return {
    layer: layerRef.current,
    source: clusterSourceRef.current,
    style: createClusteredRecreationFeatureStyle,
  };
};
