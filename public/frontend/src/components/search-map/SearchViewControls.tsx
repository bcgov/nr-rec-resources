import { useNavigate } from '@tanstack/react-router';
import { Button } from 'react-bootstrap';
import '@/components/search/filters/Filters.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faMap } from '@fortawesome/free-solid-svg-icons';
import { trackClickEvent } from '@shared/utils';
import DownloadIcon from '@shared/assets/icons/download.svg';
import DownloadKmlResultsModal from '../search/DownloadKmlResultsModal';
import { useCallback, useState } from 'react';

interface SearchViewControlsProps {
  variant: 'list' | 'map';
  totalCount: number;
  ids: string[];
}

const SearchViewControls = ({
  variant,
  totalCount,
  ids,
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
    trackClickEvent({
      category: 'Search view button',
      name: `Change to ${newView} view`,
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
        variant={variant}
      />
    </>
  );
};

export default SearchViewControls;
