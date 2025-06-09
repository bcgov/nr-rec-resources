import { useSearchParams } from 'react-router-dom';
import '@/components/search/SearchViewControls.scss';
import '@/components/search/filters/Filters.scss';

interface SearchViewControlsProps {
  style?: React.CSSProperties;
}

const SearchViewControls = ({ style }: SearchViewControlsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'list';

  const handleViewChange = (newView: string) => {
    searchParams.set('view', newView);
    setSearchParams(searchParams);
  };

  return (
    <div className={`search-view-controls d-flex align-items-center ${style}`}>
      <button
        className={`search-chip btn me-2 ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
        onClick={() => handleViewChange('list')}
      >
        List View
      </button>
      <button
        className={`search-chip btn me-0 ${view === 'map' ? 'btn-primary' : 'btn-secondary'}`}
        onClick={() => handleViewChange('map')}
      >
        Map View
      </button>
    </div>
  );
};

export default SearchViewControls;
