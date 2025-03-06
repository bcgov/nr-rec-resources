import { useMemo } from 'react';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import BaseLayer from 'ol/layer/Base';
import {
  MAP_CENTER_COORDINATES,
  MAP_EXTENT_COORDINATES,
} from '@/components/StyledVectorFeatureMap/constants';

/**
 * Creates and configures an OpenLayers map instance
 * @param layers - Array of base layers to add to the map
 * @returns Configured OpenLayers map instance
 */
export const useMapInitialization = (layers: BaseLayer[]) => {
  return useMemo(() => {
    return new OlMap({
      controls: [],
      view: new OlView({
        center: MAP_CENTER_COORDINATES,
        constrainResolution: true,
        zoom: 15,
        enableRotation: false,
        extent: MAP_EXTENT_COORDINATES,
        maxZoom: 30,
      }),
      layers: layers,
    });
  }, [layers]);
};
