import { CSSProperties, useMemo } from 'react';
import { VectorFeatureMap } from '@bcgov-prp/map';
import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import { RecreationResourceDetailModel } from '@/service/custom-models';

interface TrailMapProps {
  recResource?: RecreationResourceDetailModel;
  style?: CSSProperties;
}

export const RecreationResourceMap = ({
  recResource,
  style,
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
    <VectorFeatureMap
      enableMatomoTracking={true}
      style={style}
      features={features}
      layerStyle={layerStyle}
    />
  );
};
