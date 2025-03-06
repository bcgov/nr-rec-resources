import * as React from 'react';
import { useMemo } from 'react';
import { GeoJSON } from 'ol/format';
import { RecreationResourceDto } from '@/service/recreation-resource';
import {
  getLayerStyle,
  MAP_PROJECTION_WEB_MERCATOR,
  proj3005,
} from '@/components/StyledVectorFeatureMap/utils';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';

interface TrailMapProps {
  recResource?: RecreationResourceDto | undefined;
  mapComponentCssStyles?: React.CSSProperties;
}

export const RecreationResourceMap = ({
  recResource,
  mapComponentCssStyles,
}: TrailMapProps) => {
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

  const layerStyle = useMemo(
    () => getLayerStyle(recResource?.name ?? ''),
    [recResource],
  );

  return (
    <StyledVectorFeatureMap
      mapComponentCssStyles={mapComponentCssStyles}
      features={features}
      layerStyle={layerStyle}
    />
  );
};
