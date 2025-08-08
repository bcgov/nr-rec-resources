import '@/components/search/Search.scss';
import { Col, Row, Stack } from 'react-bootstrap';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';

const SearchBanner = () => {
  return (
    <Stack
      direction="horizontal"
      className="page-nav-container search justify-content-center"
    >
      <Row
        aria-label="Search banner"
        className="page align-items-center search-page-row"
      >
        <Col md={12} lg={3}>
          <h1 className="fs-3 mb-lg-0">Find a site or trail</h1>
        </Col>
        <Col md={12} lg={9} className="mb-3 mb-md-0">
          <RecreationSuggestionForm trackingSource="Search page list view" />
        </Col>
      </Row>
    </Stack>
  );
};

export default SearchBanner;
