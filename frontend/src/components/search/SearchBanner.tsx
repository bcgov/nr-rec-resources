import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '@/components/search/Search.scss';

const SearchBanner = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = () => {
    if (inputValue.trim() === '') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', inputValue.trim());
    }
    setSearchParams(searchParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setInputValue('');
    searchParams.delete('filter');
    setSearchParams(searchParams);
  };

  return (
    <div className="page-nav-container search">
      <nav aria-label="Search banner" className="page-nav search-banner">
        <h1>Find a recreation site or trail</h1>
        <div className="search-banner-input-container">
          <div className="search-input-wrapper">
            <input
              className="form-control"
              type="text"
              placeholder="Search by name or closest community"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {inputValue && (
              <button
                className="clear-btn"
                onClick={handleClear}
                aria-label="Clear search"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
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
