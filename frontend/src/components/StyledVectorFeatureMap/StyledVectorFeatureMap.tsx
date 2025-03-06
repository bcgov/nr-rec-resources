import * as React from 'react';
import { useCallback, useState } from 'react';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import MapContext from '@terrestris/react-util/dist/Context/MapContext/MapContext';
import { Coordinate } from 'ol/coordinate';
import { MapControls } from '@/components/StyledVectorFeatureMap/components/MapControls';
import { Feature } from 'ol';
import { StyleLike } from 'ol/style/Style';
import {
  useMapBaseLayers,
  useMapInitialization,
  useVectorLayer,
} from '@/components/StyledVectorFeatureMap/hooks';

interface StyledVectorFeatureMapProps {
  mapComponentCssStyles?: React.CSSProperties;
  features: Feature[];
  layerStyle: StyleLike;
}

export const StyledVectorFeatureMap = ({
  mapComponentCssStyles,
  features,
  layerStyle,
}: StyledVectorFeatureMapProps) => {
  const [center, setCenter] = useState<Coordinate>();
  const [zoomExtent, setZoomExtent] = useState<Coordinate>();

  const baseLayers = useMapBaseLayers();
  const map = useMapInitialization(baseLayers);

  const handleCallback = useCallback(
    (center: Coordinate, zoomExtent: Coordinate) => {
      setCenter(center);
      setZoomExtent(zoomExtent);
    },
    [],
  );

  useVectorLayer({
    map,
    features,
    layerStyle,
    onLayerAdded: handleCallback,
  });

  return (
    <MapContext.Provider value={map}>
      <MapComponent map={map} style={mapComponentCssStyles}>
        <MapControls
          extent={zoomExtent}
          center={center}
          zoom={map.getView().getZoom()}
        />
      </MapComponent>
    </MapContext.Provider>
  );
};
