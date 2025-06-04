import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Feature } from 'ol';
import {
  useAddVectorLayerToMap,
  useMapBaseLayers,
  useMapInitialization,
  useOpenLayersTracking,
} from '@/components/StyledVectorFeatureMap/hooks';
import { Coordinate } from 'ol/coordinate';
import { MapControls } from '@/components/StyledVectorFeatureMap/components/MapControls';
import { DEFAULT_MAP_ZOOM } from '@/components/StyledVectorFeatureMap/constants';

interface StyledVectorFeatureMapProps {
  /** Optional CSS styles to apply to the map container */
  mapComponentCssStyles?: React.CSSProperties;
  /** Array of OpenLayers features to display on the map as vector layers */
  features: Feature[];
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
  children,
}) => {
  const [featureExtent, setFeatureExtent] = useState<Coordinate>();
  const baseLayers = useMapBaseLayers();
  const map = useMapInitialization(baseLayers);

  // centers the map on the given extent
  const handleCallback = useCallback(
    (extent: Coordinate) => {
      const view = map.getView();
      view.fit(extent);
      view.setZoom(DEFAULT_MAP_ZOOM);
      setFeatureExtent(extent);
    },
    [map],
  );

  // add the given features are vector layers
  useAddVectorLayerToMap({
    map,
    features,
    onLayerAdded: handleCallback,
  });

  useEffect(() => {
    const targetElement = document.getElementById('map-container');
    if (targetElement) {
      map.setTarget(targetElement);
    }
  }, [map]);

  // track map interactions
  useOpenLayersTracking(map);

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
