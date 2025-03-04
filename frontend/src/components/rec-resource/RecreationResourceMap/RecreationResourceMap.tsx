import React, { useMemo } from 'react';
import { GeoJSON } from 'ol/format';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import {
  MAP_PROJECTION_BC_ALBERS,
  MAP_PROJECTION_WEB_MERCATOR,
} from '@/components/StyledVectorFeatureMap/constants';
import { getLayerStyle } from '@/components/rec-resource/RecreationResourceMap/helpers';
import { RecreationResourceDetailModel } from '@/service/custom-models';

interface TrailMapProps {
  recResource?: RecreationResourceDetailModel;
  mapComponentCssStyles?: React.CSSProperties;
}

export const RecreationResourceMap = ({
  recResource,
  mapComponentCssStyles,
}: TrailMapProps) => {
  const features = useMemo(() => {
    if (!recResource) {
      return [];
    }

    // format that converts BC_ALBERS to WEB_MERCATOR
    const geojsonFormat = new GeoJSON({
      dataProjection: MAP_PROJECTION_BC_ALBERS,
      featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    });

    return recResource?.spatial_feature_geometry?.flatMap((geom) =>
      geojsonFormat.readFeatures(geom),
    );
  }, [recResource]);

  const layerStyle = useMemo(
    () => getLayerStyle(recResource?.name ?? ''),
    [recResource],
  );

  if (!features || !features.length) {
    return null;
  }

  return (
    <StyledVectorFeatureMap
      mapComponentCssStyles={mapComponentCssStyles}
      features={features}
      layerStyle={layerStyle}
    />
  );
};
