import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@/components/search/Search.scss';
import { Button, Col, Container, Row } from 'react-bootstrap';

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
        <Container className="search-banner-input-container">
          <Row>
            <Col sm={12} md={10} className="mb-3 mb-md-0">
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
            </Col>
            <Col sm={12} md={2}>
              <Button className="w-100" onClick={handleSearch}>
                Search
              </Button>
            </Col>
          </Row>
        </Container>
      </nav>
    </div>
  );
};

export default SearchBanner;
