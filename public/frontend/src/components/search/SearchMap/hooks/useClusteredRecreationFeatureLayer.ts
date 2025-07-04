import { useEffect, useRef } from 'react';
import OLMap from 'ol/Map';
import {
  recreationSource,
  loadFeaturesForFilteredIds,
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureStyle,
  createClusteredRecreationFeatureLayer,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import {
  AnimatedClusterOptions,
  ExtendedClusterOptions,
} from '@/components/search/SearchMap/types';

export const useClusteredRecreationFeatureLayer = (
  recResourceIds: string[],
  mapRef: React.RefObject<{
    getMap: () => OLMap;
  } | null>,
  options?: {
    clusterOptions?: ExtendedClusterOptions;
    animatedClusterOptions?: AnimatedClusterOptions;
  },
) => {
  const map = mapRef.current?.getMap();
  const mapProjection = map?.getView().getProjection();
  const distance = options?.clusterOptions?.distance || 30;
  const clusterZoomThreshold = options?.clusterOptions?.clusterZoomThreshold;
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

  useEffect(() => {
    if (!map || !layerRef.current || !clusterZoomThreshold) return;

    // Disable clustering based on zoom level
    const view = map.getView();

    const updateClusterDistance = () => {
      const zoom = view.getZoom();
      console.log('Current zoom level:', zoom);
      if (zoom == null) return;

      if (zoom >= clusterZoomThreshold) {
        layerRef.current.getSource().setDistance(0);
      } else {
        layerRef.current.getSource().setDistance(distance);
      }
    };

    updateClusterDistance();

    view.on('change:resolution', updateClusterDistance);

    return () => {
      view.un('change:resolution', updateClusterDistance);
    };
  }, [clusterZoomThreshold, distance, map]);

  return {
    layer: layerRef.current,
    source: clusterSourceRef.current,
    style: createClusteredRecreationFeatureStyle,
  };
};
