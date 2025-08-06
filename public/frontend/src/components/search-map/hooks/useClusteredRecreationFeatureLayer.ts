import { useEffect, useRef, useState } from 'react';
import OLMap from 'ol/Map';
import {
  recreationSource,
  loadFeaturesForFilteredIds,
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureStyle,
  createClusteredRecreationFeatureLayer,
} from '@/components/search-map/layers/recreationFeatureLayer';
import Feature from 'ol/Feature';
import { click } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { extend, createEmpty } from 'ol/extent';
import {
  AnimatedClusterOptions,
  ExtendedClusterOptions,
} from '@/components/search-map/types';

interface UseClusteredRecreationFeatureLayerOptions {
  clusterOptions?: ExtendedClusterOptions;
  animatedClusterOptions?: AnimatedClusterOptions;
  applyHoverStyles?: boolean;
}

export const useClusteredRecreationFeatureLayer = (
  recResourceIds: string[],
  mapRef: React.RefObject<{
    getMap: () => OLMap;
  } | null>,
  options?: UseClusteredRecreationFeatureLayerOptions,
) => {
  const { applyHoverStyles = true } = options || {};
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);

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

    const view = map.getView();

    // Disable clustering based on zoom level by setting the distance to zero
    // *NOTE*: This doesn't appear to be working for the edge cases of features with identical coordinates
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
    if (!applyHoverStyles) return;

    const map = mapRef.current?.getMap();
    if (!map || !layerRef.current) return;

    const onPointerMove = (evt: any) => {
      const pixel = evt.pixel;
      const featureAtPixel = map.forEachFeatureAtPixel(
        pixel,
        (feat) => feat as Feature,
        {
          layerFilter: (candidateLayer) => candidateLayer === layerRef.current,
        },
      );

      const feature = featureAtPixel || null;

      if (feature !== hoveredFeature) {
        setHoveredFeature(feature);
      }

      map.getTargetElement().style.cursor = feature ? 'pointer' : '';
    };

    map.on('pointermove', onPointerMove);

    return () => {
      map.un('pointermove', onPointerMove);
    };
  }, [mapRef, hoveredFeature, applyHoverStyles]);

  useEffect(() => {
    if (!applyHoverStyles || !layerRef.current) return;

    layerRef.current.setStyle((feature: Feature, resolution: number) =>
      createClusteredRecreationFeatureStyle(feature, resolution, {
        iconOpacity: feature === hoveredFeature ? 0.7 : 1,
        clusterOpacity: feature === hoveredFeature ? 0.7 : 0.85,
        haloOpacity: feature === hoveredFeature ? 0.5 : 0.7,
      }),
    );

    layerRef.current.changed();
  }, [hoveredFeature, applyHoverStyles]);

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
