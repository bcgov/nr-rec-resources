import { useEffect, useState, useRef } from 'react';
import OLMap from 'ol/Map';
import ClusterSource, { Options as ClusterOptions } from 'ol/source/Cluster';
import { createEmpty, extend } from 'ol/extent';
import {
  createClusteredRecreationFeatureStyle,
  createFilteredClusterSource,
} from '@/components/search-map/layers/recreationFeatureLayer';
import Feature from 'ol/Feature';
import { click } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import { AnimatedClusterOptions } from '@/components/search-map/types';
import {
  calculateMapPadding,
  getClusterDistance,
} from '@/components/search-map/utils';

interface UseClusteredRecreationFeatureLayerOptions {
  clusterOptions?: ClusterOptions;
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
  const clusterSourceRef = useRef<ClusterSource | null>(null);

  const clusterLayer = useRef(
    new AnimatedCluster({
      style: createClusteredRecreationFeatureStyle,
      ...options?.animatedClusterOptions,
    }),
  ).current;

  // Create underlying vector source and cluster source, update cluster distance based on zoom
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const view = map.getView();
    const defaultDistance = options?.clusterOptions?.distance;
    const defaultMinDistance = options?.clusterOptions?.minDistance;
    const initialClusterOptions = getClusterDistance(
      view.getZoom(),
      defaultDistance,
      defaultMinDistance,
    );
    const clusterSource = createFilteredClusterSource(recResourceIds, {
      distance: initialClusterOptions.distance,
      minDistance: initialClusterOptions.minDistance,
    });

    clusterLayer.setSource(clusterSource);
    clusterSourceRef.current = clusterSource;

    const handleZoomChange = () => {
      const zoom = view.getZoom();
      const { distance, minDistance } = getClusterDistance(
        zoom,
        defaultDistance,
        defaultMinDistance,
      );
      clusterSource.setDistance(distance);
      clusterSource.setMinDistance(minDistance);
    };

    view.on('change:resolution', handleZoomChange);
    return () => view.un('change:resolution', handleZoomChange);
  }, [recResourceIds, options?.clusterOptions, mapRef]);

  useEffect(() => {
    if (!applyHoverStyles) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const onPointerMove = (evt: any) => {
      const pixel = evt.pixel;
      const featureAtPixel = map.forEachFeatureAtPixel(
        pixel,
        (feat) => feat as Feature,
        {
          layerFilter: (candidateLayer) => candidateLayer === clusterLayer,
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
    if (!applyHoverStyles) return;

    clusterLayer.setStyle((feature: Feature, resolution: number) =>
      createClusteredRecreationFeatureStyle(feature, resolution, {
        iconOpacity: feature === hoveredFeature ? 0.7 : 1,
        clusterOpacity: feature === hoveredFeature ? 0.7 : 0.85,
        haloOpacity: feature === hoveredFeature ? 0.5 : 0.7,
      }),
    );

    clusterLayer.changed();
  }, [hoveredFeature, applyHoverStyles]);

  useEffect(() => {
    // Add cluster zoom-to-extent on click interaction
    if (!mapRef.current) return;

    const select = new Select({
      condition: click,
      layers: [clusterLayer],
      style: null,
      multi: false,
      hitTolerance: 5,
    });

    const handleSelect = (e: any) => {
      const selected = e.selected[0];
      if (!selected) return;

      const features = selected.get('features');
      if (Array.isArray(features) && features.length > 1) {
        const extent = features.reduce((acc, feature) => {
          return extend(acc, feature.getGeometry().getExtent());
        }, createEmpty());

        const map = mapRef.current?.getMap();
        if (map) {
          const mapSize = map.getSize();
          const padding = calculateMapPadding(mapSize?.[0] ?? 1200);

          map.getView().fit(extent, {
            padding,
            duration: 500,
          });
        }
      }
    };

    select.on('select', handleSelect);
    mapRef.current?.getMap().addInteraction(select);

    return () => {
      select.un('select', handleSelect);
      mapRef.current?.getMap().removeInteraction(select);
    };
  }, [mapRef]);

  return {
    layer: clusterLayer,
    style: createClusteredRecreationFeatureStyle,
  };
};
