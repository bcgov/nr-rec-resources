import * as React from 'react';
import { useMemo } from 'react';
import { GeoJSON } from 'ol/format';
import { RecreationResourceDto } from '@/service/recreation-resource';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import {
  MAP_PROJECTION_BC_ALBERS,
  MAP_PROJECTION_WEB_MERCATOR,
} from '@/components/StyledVectorFeatureMap/constants';
import { getLayerStyle } from '@/components/rec-resource/RecreationResourceMap/helpers';

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
      dataProjection: MAP_PROJECTION_BC_ALBERS,
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
