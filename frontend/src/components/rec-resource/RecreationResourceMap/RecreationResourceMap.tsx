import { CSSProperties, useMemo } from 'react';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import { RecreationResourceDetailModel } from '@/service/custom-models';

interface TrailMapProps {
  recResource?: RecreationResourceDetailModel;
  mapComponentCssStyles?: CSSProperties;
}

export const RecreationResourceMap = ({
  recResource,
  mapComponentCssStyles,
}: TrailMapProps) => {
  const features = useMemo(
    () => getMapFeaturesFromRecResource(recResource),
    [recResource],
  );

  const layerStyle = useMemo(
    () => getLayerStyleForRecResource(recResource),
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
