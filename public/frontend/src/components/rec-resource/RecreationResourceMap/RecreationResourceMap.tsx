import { CSSProperties, useMemo } from 'react';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import {
  downloadGPX,
  downloadKML,
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { trackEvent } from '@/utils/matomo';
import { MATOMO_TRACKING_CATEGORY_MAP } from '@/components/rec-resource/RecreationResourceMap/constants';

interface TrailMapProps {
  recResource?: RecreationResourceDetailModel;
  mapComponentCssStyles?: CSSProperties;
}

/**
 * Displays a styled map for a given recreation resource, with options to download GPX/KML.
 * Returns null if no features are available.
 */
export const RecreationResourceMap = ({
  recResource,
  mapComponentCssStyles,
}: TrailMapProps) => {
  const styledFeatures = useMemo(() => {
    const features = getMapFeaturesFromRecResource(recResource);
    if (!features?.length) return [];
    const layerStyle = getLayerStyleForRecResource(recResource);
    return features.map((feature) => {
      feature.setStyle(layerStyle);
      return feature;
    });
  }, [recResource]);

  // Early return if there are no features to display or download
  if (styledFeatures.length === 0) {
    return null;
  }

  const recResourceName = recResource?.name || 'map';

  const renderDownloadButton = (label: string, clickHandler: () => void) => {
    const onClick = () => {
      trackEvent({
        category: MATOMO_TRACKING_CATEGORY_MAP,
        action: label,
        name: `${recResourceName}-${recResource?.rec_resource_id}-${label}`,
      });
      clickHandler();
    };
    return (
      <Col xs={12} md="auto">
        <Button
          variant={'outline'}
          onClick={onClick}
          className="w-100 p-0 bc-color-blue-dk"
        >
          {label}
        </Button>
      </Col>
    );
  };

  return (
    <Stack direction="vertical" gap={3}>
      <StyledVectorFeatureMap
        mapComponentCssStyles={mapComponentCssStyles}
        features={styledFeatures}
      />
      <Row className="g-md-5 g-2">
        {renderDownloadButton('Download GPX', () =>
          downloadGPX(styledFeatures, recResourceName),
        )}
        {renderDownloadButton('Download KML', () =>
          downloadKML(styledFeatures, recResourceName),
        )}
      </Row>
    </Stack>
  );
};
