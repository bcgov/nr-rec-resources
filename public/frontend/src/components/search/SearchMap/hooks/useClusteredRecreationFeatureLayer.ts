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
import { click } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { extend, createEmpty } from 'ol/extent';

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

  useEffect(() => {
    // Add cluster zoom-to-extent on click interaction
    if (!map || !layerRef.current) return;

    const select = new Select({
      condition: click,
      layers: [layerRef.current],
      style: null,
    });

    const handleSelect = (e: any) => {
      const selected = e.selected[0];
      if (!selected) return;

      const features = selected.get('features');
      if (Array.isArray(features) && features.length > 1) {
        const extent = features.reduce((acc, feature) => {
          return extend(acc, feature.getGeometry().getExtent());
        }, createEmpty());

        map.getView().fit(extent, {
          padding: [100, 100, 100, 100],
          duration: 500,
          maxZoom: 16,
        });

        select.getFeatures().clear();
      }
    };

    select.on('select', handleSelect);
    map.addInteraction(select);

    return () => {
      select.un('select', handleSelect);
      map.removeInteraction(select);
    };
  }, [map]);

  return {
    layer: layerRef.current,
    source: clusterSourceRef.current,
    style: createClusteredRecreationFeatureStyle,
  };
};
