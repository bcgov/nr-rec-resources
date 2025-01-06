import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import '@/styles/components/Search.scss';

const SearchBanner = () => {
  const [_, setSearchParams] = useSearchParams();

  const onSearchChange = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams({ filter: e.target.value });
      }, 100),
    [setSearchParams],
  );

  return (
    <div className="page-nav-container search">
      <nav aria-label="Search banner" className="page-nav search-banner">
        <h1>Find a recreation site or trail</h1>
        <input
          type="text"
          placeholder="Search..."
          onChange={onSearchChange}
        ></input>
      </nav>
    </div>
  );
};

export default SearchBanner;
