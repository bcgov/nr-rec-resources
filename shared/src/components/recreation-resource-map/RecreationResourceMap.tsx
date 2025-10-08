import { CSSProperties, useMemo } from 'react';
import { VectorFeatureMap } from '@bcgov/prp-map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/types';
import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@shared/components/recreation-resource-map/helpers';
import { StyleContext } from '@shared/components/recreation-resource-map/constants';

interface RecreationResourceMapProps {
  recResource: RecreationResourceMapData;
  mapComponentCssStyles?: CSSProperties;
}

const LAYER_CONFIG = {
  ID: 'rec-resource-layer',
  VISIBLE: true,
} as const;

export const RecreationResourceMap = ({
  recResource,
  mapComponentCssStyles,
}: RecreationResourceMapProps) => {
  const mapStyledFeatures = useMemo(() => {
    const features = getMapFeaturesFromRecResource(recResource);

    if (!features?.length) {
      return [];
    }

    const layerStyle = getLayerStyleForRecResource(
      recResource,
      StyleContext.MAP_DISPLAY,
    );

    return features.map((feature) => {
      feature.setStyle(layerStyle);
      return feature;
    });
  }, [recResource]);

  const layers = useMemo(() => {
    return [
      {
        id: LAYER_CONFIG.ID,
        layerInstance: new VectorLayer({
          source: new VectorSource({ features: mapStyledFeatures }),
          visible: LAYER_CONFIG.VISIBLE,
        }),
      },
    ];
  }, [mapStyledFeatures]);

  if (!mapStyledFeatures.length) {
    return null;
  }

  return (
    <VectorFeatureMap
      style={mapComponentCssStyles}
      layers={layers}
      enableTracking
      aria-label={`Map showing ${recResource.name || 'recreation resource'}`}
    />
  );
};

export default RecreationResourceMap;
