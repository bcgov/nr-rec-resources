import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Feature } from 'ol';
import { StyleLike } from 'ol/style/Style';
import {
  useAddVectorLayerToMap,
  useMapBaseLayers,
  useMapInitialization,
} from '@/components/StyledVectorFeatureMap/hooks';
import { Coordinate } from 'ol/coordinate';
import { MapControls } from '@/components/StyledVectorFeatureMap/components/MapControls';
import { DEFAULT_MAP_PADDING } from '@/components/StyledVectorFeatureMap/constants';

interface StyledVectorFeatureMapProps {
  /** Optional CSS styles to apply to the map container */
  mapComponentCssStyles?: React.CSSProperties;
  /** Array of OpenLayers features to display on the map as vector layers */
  features: Feature[];
  /** Style configuration for the vector features */
  layerStyle: StyleLike;
  /** Child components to render within the map context */
  children?: ReactNode;
}

/**
 * A map component that displays vector features with custom styling
 * Uses OpenLayers library for map rendering and management
 */
export const StyledVectorFeatureMap: React.FC<StyledVectorFeatureMapProps> = ({
  mapComponentCssStyles,
  features,
  layerStyle,
  children,
}) => {
  const [featureExtent, setFeatureExtent] = useState<Coordinate>();
  const baseLayers = useMapBaseLayers();
  const map = useMapInitialization(baseLayers);

  // centers the map on the given extent
  const handleCallback = useCallback(
    (extent: Coordinate) => {
      map.getView().fit(extent, { padding: DEFAULT_MAP_PADDING });
      setFeatureExtent(extent);
    },
    [map],
  );

  // add the given features are vector layers
  useAddVectorLayerToMap({
    map,
    features,
    layerStyle,
    onLayerAdded: handleCallback,
  });

  useEffect(() => {
    const targetElement = document.getElementById('map-container');
    if (targetElement) {
      map.setTarget(targetElement);
    }
  }, [map]);

  return (
    <div
      id="map-container"
      data-testid="map-container"
      style={mapComponentCssStyles}
      aria-label="styled-vector-feature-map"
    >
      {children}
      <MapControls map={map} extent={featureExtent} />
    </div>
  );
};
