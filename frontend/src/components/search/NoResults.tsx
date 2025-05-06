import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '@/components/search/NoResults.scss';

export interface NoResultProps {
  searchString: string;
  filterChips: ReactNode;
}

const NoResults = ({ searchString, filterChips }: NoResultProps) => {
  const [_, setSearchParams] = useSearchParams();
  const clearFilters = useClearFilters();

  const handleClear = () => {
    clearFilters();
    setSearchParams(() => new URLSearchParams());
  };

  return (
    <div>
      <p>
        <strong>0</strong> results containing{' '}
        <strong>&apos;{searchString}&apos;</strong>
      </p>
      {filterChips && <div className="filter-chips">{filterChips}</div>}
      <div className="no-results-msg">
        <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />{' '}
        <div className="no-results-header--right">
          <h4>Sorry...</h4>
          <p>
            <b>No sites or trails matched your search.</b>
          </p>
        </div>
      </div>
      <b>You could:</b>
      <ul>
        <li>Try a different search term</li>
        <li>Check your spelling</li>
        <li>
          Clear your search and use the filters to help find what you’re looking
          for
        </li>
        <li>
          <button
            className="btn-link p-0 text-decoration-underline"
            onClick={handleClear}
          >
            Go back to the full list
          </button>
        </li>
      </ul>
      <p>
        We’re working on making our search better as we continue to develop our
        new website - check back soon for more improvements!
      </p>
    </div>
  );
};

export default NoResults;
