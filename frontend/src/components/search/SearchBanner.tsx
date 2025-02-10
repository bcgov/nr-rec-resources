import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@/components/search/Search.scss';

const SearchBanner = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = () => {
    if (inputValue === '') {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    } else {
      searchParams.set('filter', inputValue.trim());
      setSearchParams(searchParams);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSearch();
    }
  };

  return (
    <div className="page-nav-container search">
      <nav aria-label="Search banner" className="page-nav search-banner">
        <h1>Find a recreation site or trail</h1>
        <div className="search-banner-input-container">
          <input
            className="form-control"
            type="text"
            placeholder="Search by name or closest community"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputValue(e.target.value)
            }
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </nav>
    </div>
  );
};

export default SearchBanner;
