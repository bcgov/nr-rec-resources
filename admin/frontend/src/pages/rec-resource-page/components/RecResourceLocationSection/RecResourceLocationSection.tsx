import {
  CSSProperties,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
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
import { CustomButton } from '@/components/custom-button/CustomButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { RecreationResourceDetailUIModel } from '@/services';
import { trackEvent } from '@shared/utils';
import { IMAP_URL } from '@/constants/urls';
import '@/pages/rec-resource-page/components/RecResourceLocationSection/RecResourceLocationSection.scss';

type RecResourceLocationSectionProps = {
  recResource: RecreationResourceDetailUIModel;
  showHeading?: boolean;
  extraActionButtons?: ReactNode;
  imapUrl?: string;
};

const TRACKING_ACTIONS = {
  EXPORT_MAP_FILE: 'Export map file',
};

const MAP_STYLES: CSSProperties = {
  height: '40vh',
  minHeight: '500px',
  maxHeight: '500px',
};

export const RecResourceLocationSection = ({
  recResource,
  showHeading = true,
  imapUrl = IMAP_URL,
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

  const mapviewUrl = useMemo(() => {
    const extent = getExtentFromRecResource(recResource);
    if (!extent) return undefined;
    const [minX, minY, maxX, maxY] = extent.map(Math.round);
    return `https://arcmaps.gov.bc.ca/ess/hm/mapview/?runWorkflow=Startup&Theme=TEN&extent=${minX},${minY},${maxX},${maxY}`;
  }, [recResource]);

  const hasGeometry =
    recResource?.site_point_geometry || recResource?.spatial_feature_geometry;

  if (!hasGeometry) {
    return null;
  }

  return (
    <Stack direction="vertical" gap={3}>
      {showHeading && <h2>Location</h2>}

      {recResource && (
        <RecreationResourceMap
          recResource={recResource}
          mapComponentCssStyles={MAP_STYLES}
        />
      )}

      <Stack className="map-links" direction="horizontal" gap={2}>
        <ExportMapFileBtn onClick={handleDownloadClick} />
        <CustomButton
          as="a"
          href={imapUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline-primary"
          aria-label="Open iMap (opens in a new tab)"
          rightIcon={<FontAwesomeIcon icon={faExternalLink as any} />}
        >
          iMap
        </CustomButton>
        {mapviewUrl && (
          <a
            href={mapviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="custom-btn btn btn-outline-primary"
            aria-label="Open in Mapview (opens in a new tab)"
          >
            Open in Mapview
            <FontAwesomeIcon icon={faExternalLink as any} className="ms-2" />
          </a>
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
