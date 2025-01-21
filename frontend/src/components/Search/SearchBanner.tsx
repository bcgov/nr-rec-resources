import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import '@/components/Search/Search.scss';

const SearchBanner = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onSearchChange = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === '') {
          searchParams.delete('filter');
          setSearchParams(searchParams);
        } else {
          setSearchParams({ filter: e.target.value });
        }
      }, 250),
    [searchParams, setSearchParams],
  );

  return (
    <div className="page-nav-container search">
      <nav aria-label="Search banner" className="page-nav search-banner">
        <h1>Find a recreation site or trail</h1>
        <input
          className="form-control"
          type="text"
          placeholder="Search by name or site location"
          onChange={onSearchChange}
        />
      </nav>
    </div>
  );
};

export default SearchBanner;
