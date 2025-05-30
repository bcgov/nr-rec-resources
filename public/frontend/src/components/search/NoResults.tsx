import { useEffect, useRef } from 'react';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '@/components/search/NoResults.scss';

const NoResults = () => {
  const clearFilters = useClearFilters();
  const { handleClearSearch } = useSearchInput();

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClear = () => {
    clearFilters();
    handleClearSearch();
  };

  useEffect(() => {
    // Focus the button when there are no results
    buttonRef.current?.focus();
  }, []);

  return (
    <div>
      <div className="no-results-msg">
        <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />{' '}
        <div className="no-results-header--right">
          <h4>Sorry...</h4>
          <p id="no-results">
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
            ref={buttonRef}
            aria-label="Go back to the full list"
            aria-describedby="no-results"
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
