import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { VectorFeatureMap } from '@bcgov/prp-map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { RecreationResourceMapData } from './types';
import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from './helpers';
import { StyleContext } from './constants';

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
  const mapRef = useRef<{ getMap: () => any } | null>(null);
  const mapHostRef = useRef<HTMLDivElement | null>(null);

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

  const hasFeatures = mapStyledFeatures.length > 0;

  useEffect(() => {
    if (!hasFeatures) {
      return;
    }

    const map = mapRef.current?.getMap?.();
    const host = mapHostRef.current;
    const scopedMapContainer = host?.querySelector(
      '[data-testid="map-container"]',
    );

    if (!map || !(scopedMapContainer instanceof HTMLElement)) {
      return;
    }

    // prp-map uses a shared #map-container id internally; retarget to this instance.
    map.setTarget(scopedMapContainer);
  }, [hasFeatures]);

  if (!hasFeatures) {
    return null;
  }

  return (
    <div ref={mapHostRef}>
      <VectorFeatureMap
        ref={mapRef}
        style={{
          position: 'relative',
          ...mapComponentCssStyles,
        }}
        layers={layers}
        enableTracking
        aria-label={`Map showing ${recResource.name || 'recreation resource'}`}
      />
    </div>
  );
};

export default RecreationResourceMap;
