import { useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import '@/components/search/filters/Filters.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faMap } from '@fortawesome/free-solid-svg-icons';

interface SearchViewControlsProps {
  variant: 'list' | 'map';
}

const SearchViewControls = ({ variant }: SearchViewControlsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleViewChange = (newView: string) => {
    searchParams.set('view', newView);
    setSearchParams(searchParams);
  };

  return (
    <Button
      className="search-chip btn h-2"
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
