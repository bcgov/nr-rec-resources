import { useNavigate } from '@tanstack/react-router';
import { Button } from 'react-bootstrap';
import '@/components/search/filters/Filters.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faMap } from '@fortawesome/free-solid-svg-icons';
import { trackEvent } from '@shared/utils';
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
}

const SearchViewControls = ({ variant }: SearchViewControlsProps) => {
  const navigate = useNavigate({ from: '/search' });

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

  return (
    <>
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
    </>
  );
};

export default SearchViewControls;
