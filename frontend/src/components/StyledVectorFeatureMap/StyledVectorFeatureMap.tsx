import React, { ReactNode, useCallback, useState } from 'react';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import MapContext from '@terrestris/react-util/dist/Context/MapContext/MapContext';
import { Coordinate } from 'ol/coordinate';
import { MapControls } from '@/components/StyledVectorFeatureMap/components/MapControls';
import { Feature } from 'ol';
import { StyleLike } from 'ol/style/Style';
import {
  useAddVectorLayerToMap,
  useMapBaseLayers,
  useMapInitialization,
} from '@/components/StyledVectorFeatureMap/hooks';

interface StyledVectorFeatureMapProps {
  /** Optional CSS styles to apply to the map container */
  mapComponentCssStyles?: React.CSSProperties;
  /** Array of OpenLayers features to display on the map */
  features: Feature[];
  /** Style configuration for the vector features */
  layerStyle: StyleLike;
  /** Child components to render within the map context */
  children?: ReactNode;
}

/**
 * A map component that displays vector features with custom styling
 * Manages map state and provides map context to child components
 *
 * @param props - Component properties
 * @returns React component wrapped in map context
 */
export const StyledVectorFeatureMap: React.FC<StyledVectorFeatureMapProps> = ({
  mapComponentCssStyles,
  features,
  layerStyle,
  children,
}) => {
  const [zoomExtent, setZoomExtent] = useState<Coordinate>();

  const baseLayers = useMapBaseLayers();
  const map = useMapInitialization(baseLayers);

  const handleCallback = useCallback((zoomExtent: Coordinate) => {
    setZoomExtent(zoomExtent);
  }, []);

  useAddVectorLayerToMap({
    map,
    features,
    layerStyle,
    onLayerAdded: handleCallback,
  });

  return (
    <MapContext.Provider value={map}>
      <MapComponent map={map} style={mapComponentCssStyles}>
        {children}
        <MapControls extent={zoomExtent} zoom={map.getView().getZoom()} />
      </MapComponent>
    </MapContext.Provider>
  );
};
