import { useSearchParams } from 'react-router-dom';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';

const NoResults = () => {
  const [_, setSearchParams] = useSearchParams();
  const clearFilters = useClearFilters();

  const handleClear = () => {
    clearFilters();
    setSearchParams(() => new URLSearchParams());
  };

  return (
    <div>
      <p> Sorry, no sites or trails matched your search.</p>
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
