import { useNavigate } from '@tanstack/react-router';
import { Button } from 'react-bootstrap';
import '@/components/search/filters/Filters.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faMap } from '@fortawesome/free-solid-svg-icons';
import { trackEvent } from '@shared/utils';
import DownloadIcon from '@shared/assets/icons/download.svg';
import DownloadKmlResultsModal from '../search/DownloadKmlResultsModal';
import { useCallback, useState } from 'react';
import {
  MATOMO_ACTION_LISTVIEW_MAP,
  MATOMO_ACTION_MAPVIEW_LIST,
  MATOMO_CATEGORY_LIST_VIEW,
  MATOMO_CATEGORY_MAP_VIEW,
  MATOMO_NAME_LISTVIEW_MAP,
  MATOMO_NAME_MAPVIEW_LIST,
} from '@/constants/analytics';

interface SearchViewControlsProps {
  variant: 'list' | 'map';
  totalCount: number;
  ids: string[];
  trackingView?: 'list' | 'map';
}

const SearchViewControls = ({
  variant,
  totalCount,
  ids,
  trackingView,
}: SearchViewControlsProps) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const navigate = useNavigate({ from: '/search' });

  const DOWNLOAD_ICON_CONFIG = {
    WIDTH: 16,
    HEIGHT: 16,
    ALT: 'Download KML File',
  } as const;

  const handleViewChange = (newView: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        view: newView,
      }),
    });
    if (newView === 'map') {
      trackEvent({
        category: MATOMO_CATEGORY_MAP_VIEW,
        action: MATOMO_ACTION_MAPVIEW_LIST,
        name: MATOMO_NAME_MAPVIEW_LIST,
      });
      return;
    }

    trackEvent({
      category: MATOMO_CATEGORY_LIST_VIEW,
      action: MATOMO_ACTION_LISTVIEW_MAP,
      name: MATOMO_NAME_LISTVIEW_MAP,
    });
  };

  const handleDownloadClick = useCallback(() => {
    setIsDownloadModalOpen(true);
  }, []);

  return (
    <>
      <Button
        className="search-chip btn h-2 text-nowrap"
        variant="secondary"
        onClick={handleDownloadClick}
        name="DownloadButton"
      >
        <img
          src={DownloadIcon}
          alt={DOWNLOAD_ICON_CONFIG.ALT}
          width={DOWNLOAD_ICON_CONFIG.WIDTH}
          height={DOWNLOAD_ICON_CONFIG.HEIGHT}
        />
        &nbsp;Download KML
      </Button>{' '}
      <Button
        className="search-chip btn h-2 text-nowrap"
        variant="secondary"
        onClick={() => handleViewChange(variant)}
      >
        <FontAwesomeIcon
          icon={variant === 'list' ? faList : faMap}
          className="me-2"
        />
        Show {variant}
      </Button>
      <DownloadKmlResultsModal
        isOpen={isDownloadModalOpen}
        setIsOpen={setIsDownloadModalOpen}
        searchResultsNumber={totalCount}
        ids={ids}
        trackingView={trackingView ?? (variant === 'list' ? 'map' : 'list')}
      />
    </>
  );
};

export default SearchViewControls;
