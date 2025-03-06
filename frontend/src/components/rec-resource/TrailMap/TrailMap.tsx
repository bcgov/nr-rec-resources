import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import MapContext from '@terrestris/react-util/dist/Context/MapContext/MapContext';
import { GeoJSON } from 'ol/format';
import { RecreationResourceDto } from '@/service/recreation-resource';
import { Coordinate } from 'ol/coordinate';
import { getLayerStyle } from '@/components/rec-resource/TrailMap/utils/styles';
import {
  MAP_PROJECTION_WEB_MERCATOR,
  proj3005,
} from '@/components/rec-resource/TrailMap/utils/projections';
import { MapControls } from '@/components/rec-resource/TrailMap/components/MapControls';
import { useMapBaseLayers } from '@/components/rec-resource/TrailMap/hooks/useMapBaseLayers';
import { useMapInitialization } from '@/components/rec-resource/TrailMap/hooks/useMapInitialization';
import { useVectorLayer } from '@/components/rec-resource/TrailMap/hooks/useVectorLayer';

interface TrailMapProps {
  recResource?: RecreationResourceDto | undefined;
  style?: React.CSSProperties;
}

export const TrailMap = ({ recResource, style }: TrailMapProps) => {
  const [center, setCenter] = useState<Coordinate>();
  const [zoomExtent, setZoomExtent] = useState<Coordinate>();

  const baseLayers = useMapBaseLayers();
  const map = useMapInitialization(baseLayers);

  const features = useMemo(() => {
    if (!recResource) return [];
    const geojsonFormat = new GeoJSON({
      dataProjection: proj3005,
      featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    });
    return recResource.geometry.flatMap((geom) =>
      geojsonFormat.readFeatures(geom),
    );
  }, [recResource]);

  const handleCallback = useCallback(
    (center: Coordinate, zoomExtent: Coordinate) => {
      setCenter(center);
      setZoomExtent(zoomExtent);
    },
    [],
  );

  const layerStyle = useMemo(
    () => getLayerStyle(recResource?.name ?? ''),
    [recResource],
  );

  useVectorLayer({
    map,
    features,
    layerStyle,
    onLayerAdded: handleCallback,
  });

  return (
    <MapContext.Provider value={map}>
      <MapComponent map={map} style={style}>
        <MapControls
          extent={zoomExtent}
          center={center}
          zoom={map.getView().getZoom()}
        />
      </MapComponent>
    </MapContext.Provider>
  );
};
