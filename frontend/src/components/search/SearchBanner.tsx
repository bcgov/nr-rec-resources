import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@/components/search/Search.scss';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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
      <Container
        fluid
        aria-label="Search banner"
        className="search-banner d-flex justify-content-center"
      >
        <Row className="w-100 search-banner-input-container align-items-center justify-content-center py-3">
          <Col sm={12} md={4} className="ps-md-0">
            <h1>Find a recreation site or trail</h1>
          </Col>
          <Col sm={12} md={6} className="mb-3 mb-md-0">
            <div className="input-wrapper">
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
          </Col>
          <Col sm={12} md={2} className="pe-md-0">
            <Button className="w-100 fs-6" onClick={handleSearch}>
              Search
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SearchBanner;
