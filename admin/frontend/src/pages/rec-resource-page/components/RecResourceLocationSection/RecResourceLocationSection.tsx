import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { Stack } from 'react-bootstrap';
import {
  RecreationResourceMap,
  MATOMO_TRACKING_CATEGORY_MAP,
  DownloadMapModal,
  getMapFeaturesFromRecResource,
  getLayerStyleForRecResource,
  getExtentFromRecResource,
  StyleContext,
  ExportMapFileBtn,
} from '@shared/components/recreation-resource-map';
import { ExternalLink } from '@shared/components/links';
import { RecreationResourceDetailUIModel } from '@/services';
import { trackEvent } from '@shared/utils';
import '@/pages/rec-resource-page/components/RecResourceLocationSection/RecResourceLocationSection.scss';

type RecResourceLocationSectionProps = {
  recResource: RecreationResourceDetailUIModel;
};

const TRACKING_ACTIONS = {
  EXPORT_MAP_FILE: 'Export map file',
};

const MAP_STYLES: CSSProperties = {
  height: '40vh',
  minHeight: '500px',
  maxHeight: '500px',
};

const ARC_MAPS_BASE_URL =
  'https://arcmaps.gov.bc.ca/ess/hm/mapview/?runWorkflow=Startup&Theme=TEN';

export const RecResourceLocationSection = ({
  recResource,
}: RecResourceLocationSectionProps) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const recResourceName = useMemo(
    () => recResource?.name || 'Unnamed Resource',
    [recResource?.name],
  );

  const downloadStyledFeatures = useMemo(() => {
    const features = getMapFeaturesFromRecResource(recResource);

    if (!features?.length) {
      return [];
    }

    const layerStyle = getLayerStyleForRecResource(
      recResource,
      StyleContext.DOWNLOAD,
    );

    return features.map((feature) => {
      feature.setStyle(layerStyle);
      return feature;
    });
  }, [recResource]);

  const handleDownloadClick = useCallback(() => {
    trackEvent({
      category: MATOMO_TRACKING_CATEGORY_MAP,
      action: TRACKING_ACTIONS.EXPORT_MAP_FILE,
      name: `${recResourceName}-${recResource?.rec_resource_id}-${TRACKING_ACTIONS.EXPORT_MAP_FILE}`,
    });
    setIsDownloadModalOpen(true);
  }, [recResourceName, recResource?.rec_resource_id]);

  const hasGeometry =
    recResource?.site_point_geometry || recResource?.spatial_feature_geometry;

  const mapviewUrl = useMemo(() => {
    const extent = getExtentFromRecResource(recResource);
    if (!extent) {
      return null;
    }

    // Format extent as minX,minY,maxX,maxY (rounded to integers)
    const extentStr = extent.map((val) => Math.round(val)).join(',');
    return `${ARC_MAPS_BASE_URL}&extent=${extentStr}`;
  }, [recResource]);

  if (!hasGeometry) {
    return null;
  }

  return (
    <Stack direction="vertical" gap={3}>
      <h2>Location</h2>

      {recResource && (
        <RecreationResourceMap
          recResource={recResource}
          mapComponentCssStyles={MAP_STYLES}
        />
      )}

      <Stack className="map-links" direction="horizontal" gap={1}>
        <ExportMapFileBtn onClick={handleDownloadClick} />
        {mapviewUrl && (
          <ExternalLink url={mapviewUrl} label="Open in Mapview" />
        )}
      </Stack>

      <DownloadMapModal
        isOpen={isDownloadModalOpen}
        setIsOpen={setIsDownloadModalOpen}
        styledFeatures={downloadStyledFeatures}
        recResource={recResource}
        getResourceDetailUrl={(recResourceId: string) =>
          `/recreation-resource/${recResourceId}`
        }
      />
    </Stack>
  );
};
