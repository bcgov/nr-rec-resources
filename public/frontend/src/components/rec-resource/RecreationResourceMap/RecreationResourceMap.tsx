import { CSSProperties, useMemo } from 'react';
import { VectorFeatureMap } from '@bcgov/prp-map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
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
  recResource: RecreationResourceDetailModel;
  mapComponentCssStyles?: CSSProperties;
}

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

  const layers = useMemo(
    () => [
      {
        id: 'rec-resource-layer',
        layerInstance: new VectorLayer({
          source: new VectorSource({ features: styledFeatures }),
          visible: true,
        }),
      },
    ],
    [styledFeatures],
  );

  if (!styledFeatures || !styledFeatures.length) {
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
      <VectorFeatureMap style={mapComponentCssStyles} layers={layers} />
      <Row className="g-md-5 g-2">
        {renderDownloadButton('Download KML', () =>
          downloadKML(styledFeatures, recResource),
        )}
        {renderDownloadButton('Download GPX', () =>
          downloadGPX(styledFeatures, recResourceName),
        )}
      </Row>
    </Stack>
  );
};
