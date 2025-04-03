import '@/components/search/Search.scss';
import { Col, Container, Row } from 'react-bootstrap';
import { RecreationSearchForm } from '@/components/recreation-search-form';

const SearchBanner = () => {
  return (
    <div className="page-nav-container search">
      <Container
        fluid
        aria-label="Search banner"
        className="search-banner d-flex justify-content-center"
      >
        <Row className="w-100 search-banner-input-container align-items-center justify-content-center py-3">
          <Col sm={12} md={4} className="ps-md-0">
            <h1>Find a site or trail</h1>
          </Col>
          <Col sm={12} md={8} className="mb-3 mb-md-0 pe-md-0">
            <RecreationSearchForm />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SearchBanner;
