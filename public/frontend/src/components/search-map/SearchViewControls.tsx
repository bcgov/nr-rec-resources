import { useNavigate } from '@tanstack/react-router';
import { Button } from 'react-bootstrap';
import '@/components/search/filters/Filters.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faMap } from '@fortawesome/free-solid-svg-icons';
import { trackClickEvent } from '@shared/utils';

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
    trackClickEvent({
      category: 'Search view button',
      name: `Change to ${newView} view`,
    });
  };

  return (
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
  );
};

export default SearchViewControls;
