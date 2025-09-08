import { CSSProperties, useMemo, useState } from 'react';
import { VectorFeatureMap } from '@bcgov/prp-map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { trackEvent } from '@/utils/matomo';
import {
  MATOMO_TRACKING_CATEGORY_MAP,
  StyleContext,
} from '@/components/rec-resource/RecreationResourceMap/constants';
import DownloadMapModal from '@/components/rec-resource/RecreationResourceMap/DownloadMapModal';
import DownloadIcon from '@/images/icons/download.svg';

interface TrailMapProps {
  recResource: RecreationResourceDetailModel;
  mapComponentCssStyles?: CSSProperties;
}

export const RecreationResourceMap = ({
  recResource,
  mapComponentCssStyles,
}: TrailMapProps) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Memoize styled features for map display (green linear features)
  const mapStyledFeatures = useMemo(() => {
    const features = getMapFeaturesFromRecResource(recResource);

    if (!features?.length) {
      return [];
    }

    const layerStyle = getLayerStyleForRecResource(
      recResource,
      StyleContext.MAP_DISPLAY,
    ); // true for map display

    // Apply style to each feature
    return features.map((feature) => {
      feature.setStyle(layerStyle);
      return feature;
    });
  }, [recResource]);

  // Memoize styled features for download (pink linear features)
  const downloadStyledFeatures = useMemo(() => {
    const features = getMapFeaturesFromRecResource(recResource);

    if (!features?.length) {
      return [];
    }

    const layerStyle = getLayerStyleForRecResource(
      recResource,
      StyleContext.DOWNLOAD,
    ); // false for download

    // Apply style to each feature
    return features.map((feature) => {
      feature.setStyle(layerStyle);
      return feature;
    });
  }, [recResource]);

  // Memoize layers to prevent unnecessary VectorLayer recreations
  const layers = useMemo(() => {
    if (!mapStyledFeatures.length) {
      return [];
    }

    return [
      {
        id: 'rec-resource-layer',
        layerInstance: new VectorLayer({
          source: new VectorSource({ features: mapStyledFeatures }),
          visible: true,
        }),
      },
    ];
  }, [mapStyledFeatures]);

  if (!mapStyledFeatures || !mapStyledFeatures.length) {
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
          <img src={DownloadIcon} alt="download icon" width={16} height={16} />
          &nbsp;
          {label}
        </Button>
      </Col>
    );
  };

  return (
    <Stack direction="vertical" gap={3}>
      <VectorFeatureMap style={mapComponentCssStyles} layers={layers} />
      <Row className="g-md-5 g-2">
        {renderDownloadButton('Export map file', () =>
          setIsDownloadModalOpen(true),
        )}
      </Row>
      <DownloadMapModal
        isOpen={isDownloadModalOpen}
        setIsOpen={setIsDownloadModalOpen}
        styledFeatures={downloadStyledFeatures}
        recResource={recResource}
      />
    </Stack>
  );
};
